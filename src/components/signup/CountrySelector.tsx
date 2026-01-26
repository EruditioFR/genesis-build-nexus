import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCountriesForLanguage } from '@/lib/countries';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
  const { i18n, t } = useTranslation('auth');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const countries = useMemo(() => {
    return getCountriesForLanguage(i18n.language);
  }, [i18n.language]);

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const searchLower = search.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [countries, search]);

  const selectedCountry = useMemo(() => {
    return countries.find(c => c.code === value);
  }, [countries, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch('');
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

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between w-full h-12 px-3 bg-white border-2 border-[#1a1a2e]/20 rounded-md text-left',
          'focus:outline-none focus:border-primary transition-colors',
          !value && 'text-[#1a1a2e]/40'
        )}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#1a1a2e]/50" />
          <span className={value ? 'text-[#1a1a2e]' : 'text-[#1a1a2e]/40'}>
            {selectedCountry?.name || t('signup.countryPlaceholder')}
          </span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-[#1a1a2e]/50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#1a1a2e]/20 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-[#1a1a2e]/10">
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('signup.searchCountry')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-sm text-[#1a1a2e]/50">
                {t('signup.noCountryFound')}
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-[#1a1a2e]/5 transition-colors',
                    value === country.code && 'bg-primary/10 text-primary'
                  )}
                >
                  <span>{country.name}</span>
                  {value === country.code && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
