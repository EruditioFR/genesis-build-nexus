import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCitiesForCountry } from '@/lib/cities';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  countryCode: string;
  className?: string;
}

export function CitySelector({ value, onChange, countryCode, className }: CitySelectorProps) {
  const { t } = useTranslation('auth');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cities = useMemo(() => {
    return getCitiesForCountry(countryCode);
  }, [countryCode]);

  const filteredCities = useMemo(() => {
    if (!search) return cities;
    const searchLower = search.toLowerCase();
    return cities.filter(c => c.toLowerCase().includes(searchLower));
  }, [cities, search]);

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
    if (value && !cities.includes(value)) {
      onChange('');
    }
  }, [countryCode, cities, value, onChange]);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    // Allow free text input
    onChange(newValue);
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
          value={open ? search : value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          className="pl-10 pr-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <ChevronDown className={cn('w-4 h-4 text-[#1a1a2e]/50 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#1a1a2e]/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredCities.map((city) => (
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
    </div>
  );
}
