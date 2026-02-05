import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  countryCode: string;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}

export function CitySelector({ value, onChange, countryCode, className }: CitySelectorProps) {
  const { t } = useTranslation('auth');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search for cities via Nominatim API
  const searchCities = useCallback(async (query: string, country: string) => {
    if (!query || query.length < 2 || !country) {
      setCities([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        countrycodes: country.toLowerCase(),
        featuretype: 'city',
        'accept-language': 'fr,en',
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'User-Agent': 'FamilyGarden/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data: NominatimResult[] = await response.json();
      
      // Extract city names from results
      const cityNames = data
        .map((result) => {
          // Try to get the most specific city name
          return (
            result.address?.city ||
            result.address?.town ||
            result.address?.village ||
            result.address?.municipality ||
            result.name
          );
        })
        .filter((name): name is string => !!name)
        // Remove duplicates
        .filter((name, index, arr) => arr.indexOf(name) === index);

      setCities(cityNames);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error fetching cities:', error);
        setCities([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search && countryCode) {
        searchCities(search, countryCode);
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, countryCode, searchCities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset city when country changes
  useEffect(() => {
    if (value) {
      onChange('');
      setSearch('');
      setCities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch('');
    setCities([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    // Allow free text input
    onChange(newValue);
    if (!open) {
      setOpen(true);
    }
  };

  if (!countryCode) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center w-full h-12 px-3 bg-white/50 border-2 border-[#1a1a2e]/10 rounded-md cursor-not-allowed">
          <MapPin className="w-5 h-5 text-[#1a1a2e]/30 mr-2" />
          <span className="text-[#1a1a2e]/30">{t('signup.selectCountryFirst')}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('signup.cityPlaceholder')}
          value={open ? search || value : value}
          onChange={handleInputChange}
          onFocus={() => {
            setOpen(true);
            setSearch(value);
          }}
          className="pl-10 pr-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-[#1a1a2e]/50 animate-spin" />}
          <button
            type="button"
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className={cn('w-4 h-4 text-[#1a1a2e]/50 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open && cities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#1a1a2e]/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelect(city)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-[#1a1a2e]/5 transition-colors',
                value === city && 'bg-primary/10 text-primary'
              )}
            >
              <span>{city}</span>
              {value === city && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}

      {open && search && search.length >= 2 && !loading && cities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#1a1a2e]/20 rounded-md shadow-lg p-3 text-sm text-[#1a1a2e]/60">
          {t('signup.noCityFound', 'Aucune ville trouvée')}
        </div>
      )}
    </div>
  );
}
