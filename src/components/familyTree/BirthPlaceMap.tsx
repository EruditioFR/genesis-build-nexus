import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { geocodeAndCachePersons, type GeocodeProgress } from '@/lib/geocoding';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { FamilyPerson } from '@/types/familyTree';

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Birth icons (colored circles) ---
function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 14px; height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const maleIcon = createColoredIcon('#3b82f6');
const femaleIcon = createColoredIcon('#ec4899');
const otherIcon = createColoredIcon('#9ca3af');

function getBirthIcon(gender: string | null) {
  if (gender === 'male') return maleIcon;
  if (gender === 'female') return femaleIcon;
  return otherIcon;
}

// --- Death icons (black circle with white cross ✝) ---
function createDeathIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: #1a1a1a;
      width: 18px; height: 18px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 12px; line-height: 1;
    ">✝</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

const deathIcon = createDeathIcon();

function formatDates(person: FamilyPerson) {
  const birth = person.birth_date ? new Date(person.birth_date).getFullYear() : '?';
  const death = person.is_alive === false && person.death_date
    ? new Date(person.death_date).getFullYear()
    : person.is_alive === false ? '?' : null;
  return death !== null ? `${birth} – ${death}` : `${birth}`;
}

interface MapMarker {
  person: FamilyPerson;
  lat: number;
  lng: number;
  type: 'birth' | 'death';
}

interface BirthPlaceMapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeId: string | null;
}

export function BirthPlaceMap({ open, onOpenChange, treeId }: BirthPlaceMapProps) {
  const { t } = useTranslation('familyTree');
  const [persons, setPersons] = useState<FamilyPerson[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);
  const [geocodeProgress, setGeoCodeProgress] = useState<GeocodeProgress | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [isGeocoding, setIsGeocoding] = useState(false);
  const hasStarted = useRef(false);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const initTimerRef = useRef<number | null>(null);

  const markers = useMemo(() => {
    const result: MapMarker[] = [];
    for (const p of persons) {
      // Birth markers
      const bLat = p.birth_place_lat ?? geocodedCoords.get(p.id)?.lat;
      const bLng = p.birth_place_lng ?? geocodedCoords.get(p.id)?.lng;
      if (bLat != null && bLng != null) {
        result.push({ person: p, lat: Number(bLat), lng: Number(bLng), type: 'birth' });
      }
      // Death markers
      const dLat = p.death_place_lat ?? geocodedCoords.get(`${p.id}:death`)?.lat;
      const dLng = p.death_place_lng ?? geocodedCoords.get(`${p.id}:death`)?.lng;
      if (dLat != null && dLng != null) {
        result.push({ person: p, lat: Number(dLat), lng: Number(dLng), type: 'death' });
      }
    }
    return result;
  }, [persons, geocodedCoords]);

  const personsWithPlace = persons.filter(p => p.birth_place || p.death_place);
  const birthMarkers = markers.filter(m => m.type === 'birth');
  const deathMarkers = markers.filter(m => m.type === 'death');

  // Destroy map helper
  const destroyMap = useCallback(() => {
    if (initTimerRef.current != null) {
      window.clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    clusterGroupRef.current = null;
  }, []);

  // Initialize map via callback ref
  const mapCallbackRef = useCallback((node: HTMLDivElement | null) => {
    containerElRef.current = node;
    if (!node) return;

    initTimerRef.current = window.setTimeout(() => {
      if (mapRef.current) return;

      const map = L.map(node, { zoomControl: true }).setView([46.6, 2.3], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const clusterGroup = L.markerClusterGroup();
      map.addLayer(clusterGroup);

      mapRef.current = map;
      clusterGroupRef.current = clusterGroup;

      const t1 = window.setTimeout(() => map.invalidateSize(false), 100);
      const t2 = window.setTimeout(() => map.invalidateSize(false), 400);

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          window.requestAnimationFrame(() => map.invalidateSize(false));
        });
        observer.observe(node);
        resizeObserverRef.current = observer;
      }

      (map as any)._extraTimers = [t1, t2];
    }, 350);
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) destroyMap();
  }, [open, destroyMap]);

  // Update markers when data changes
  useEffect(() => {
    if (!clusterGroupRef.current || !mapRef.current) return;

    const cluster = clusterGroupRef.current;
    cluster.clearLayers();

    for (const { person, lat, lng, type } of markers) {
      const icon = type === 'death' ? deathIcon : getBirthIcon(person.gender ?? null);
      const marker = L.marker([lat, lng], { icon });
      const maidenInfo = person.maiden_name ? ` (${t('person.born')} ${person.maiden_name})` : '';
      const placeLabel = type === 'death' ? (person.death_place || '') : (person.birth_place || '');
      const typeLabel = type === 'death' ? `✝ ${t('map.deathPlace')}` : `🎂 ${t('map.birthPlace')}`;
      marker.bindPopup(`
        <div style="min-width:150px">
          <p style="font-weight:600;margin:0">${person.first_names} ${person.last_name}${maidenInfo}</p>
          <p style="font-size:12px;color:#6b7280;margin:2px 0">${formatDates(person)}</p>
          <p style="font-size:11px;font-weight:500;margin:4px 0 1px">${typeLabel}</p>
          <p style="font-size:12px;margin:2px 0">${placeLabel}</p>
        </div>
      `);
      cluster.addLayer(marker);
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => L.latLng(m.lat, m.lng)));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [markers, t]);

  // Fetch ALL persons from the tree when dialog opens
  useEffect(() => {
    if (!open || !treeId || hasStarted.current) return;
    hasStarted.current = true;

    const fetchAllPersons = async () => {
      setIsLoadingPersons(true);
      const { data, error } = await supabase
        .from('family_persons')
        .select('*')
        .eq('tree_id', treeId);
      
      if (error) {
        console.error('Error fetching all persons for map:', error);
        setIsLoadingPersons(false);
        return;
      }

      const allPersons = (data ?? []) as unknown as FamilyPerson[];
      setPersons(allPersons);
      setIsLoadingPersons(false);

      // Start geocoding
      const personsToGeocode = allPersons.filter(
        p => (p.birth_place && (p.birth_place_lat == null || p.birth_place_lng == null))
          || (p.death_place && (p.death_place_lat == null || p.death_place_lng == null))
      );

      if (personsToGeocode.length === 0) return;

      setIsGeocoding(true);
      geocodeAndCachePersons(
        personsToGeocode,
        supabase,
        (progress) => {
          setGeoCodeProgress(progress);
          setGeocodedCoords(new Map(progress.results));
        }
      ).then(() => {
        setIsGeocoding(false);
      });
    };

    fetchAllPersons();
  }, [open, treeId]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      hasStarted.current = false;
      setPersons([]);
      setGeoCodeProgress(null);
      setGeocodedCoords(new Map());
      setIsGeocoding(false);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyMap();
  }, [destroyMap]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[85dvh] max-h-[85dvh] overflow-hidden p-0 !flex !flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('map.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('map.personsLocated', { located: birthMarkers.length, total: personsWithPlace.length })}
          </DialogDescription>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>🎂 {t('map.birthCount', { count: birthMarkers.length })}</span>
            <span>✝ {t('map.deathCount', { count: deathMarkers.length })}</span>
            {isGeocoding && geocodeProgress && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('map.geocoding', { done: geocodeProgress.done, total: geocodeProgress.total })}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="relative flex-1 min-h-[320px]">
          {isLoadingPersons ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : personsWithPlace.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground">{t('map.noLocations')}</p>
              </div>
            </div>
          ) : (
            <div
              ref={mapCallbackRef}
              style={{ position: 'absolute', inset: 0, minHeight: 320 }}
              className="rounded-b-lg"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
