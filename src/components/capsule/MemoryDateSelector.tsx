import { useState, useEffect } from 'react';
import { CalendarHeart, X, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DatePrecision = 'exact' | 'month' | 'year' | 'range';

export interface MemoryDateValue {
  precision: DatePrecision;
  date?: Date | null;
  month?: number; // 1-12
  year?: number;
  yearStart?: number;
  yearEnd?: number;
}

interface MemoryDateSelectorProps {
  value: MemoryDateValue | null;
  onChange: (value: MemoryDateValue | null) => void;
  required?: boolean;
  className?: string;
}

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 150 }, (_, i) => currentYear - i);

export const formatMemoryDate = (value: MemoryDateValue | null): string => {
  if (!value) return '';

  switch (value.precision) {
    case 'exact':
      return value.date ? format(value.date, 'PPP', { locale: fr }) : '';
    case 'month':
      if (value.month && value.year) {
        const monthName = MONTHS.find(m => m.value === value.month)?.label || '';
        return `${monthName} ${value.year}`;
      }
      return '';
    case 'year':
      return value.year ? `${value.year}` : '';
    case 'range':
      if (value.yearStart && value.yearEnd) {
        return `${value.yearStart} - ${value.yearEnd}`;
      }
      return '';
    default:
      return '';
  }
};

export const memoryDateToStorage = (value: MemoryDateValue | null): { 
  memory_date: string | null;
  memory_date_precision: DatePrecision | null;
  memory_date_year_end: number | null;
} => {
  if (!value) {
    return { memory_date: null, memory_date_precision: null, memory_date_year_end: null };
  }

  switch (value.precision) {
    case 'exact':
      return {
        memory_date: value.date ? format(value.date, 'yyyy-MM-dd') : null,
        memory_date_precision: 'exact',
        memory_date_year_end: null,
      };
    case 'month':
      if (value.month && value.year) {
        // Store as first day of the month
        const monthStr = value.month.toString().padStart(2, '0');
        return {
          memory_date: `${value.year}-${monthStr}-01`,
          memory_date_precision: 'month',
          memory_date_year_end: null,
        };
      }
      return { memory_date: null, memory_date_precision: null, memory_date_year_end: null };
    case 'year':
      if (value.year) {
        return {
          memory_date: `${value.year}-01-01`,
          memory_date_precision: 'year',
          memory_date_year_end: null,
        };
      }
      return { memory_date: null, memory_date_precision: null, memory_date_year_end: null };
    case 'range':
      if (value.yearStart && value.yearEnd) {
        return {
          memory_date: `${value.yearStart}-01-01`,
          memory_date_precision: 'range',
          memory_date_year_end: value.yearEnd,
        };
      }
      return { memory_date: null, memory_date_precision: null, memory_date_year_end: null };
    default:
      return { memory_date: null, memory_date_precision: null, memory_date_year_end: null };
  }
};

export const storageToMemoryDate = (
  memoryDate: string | null,
  precision: string | null,
  yearEnd: number | null
): MemoryDateValue | null => {
  if (!memoryDate || !precision) return null;

  const dateParts = memoryDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);

  switch (precision) {
    case 'exact':
      return {
        precision: 'exact',
        date: new Date(memoryDate),
      };
    case 'month':
      return {
        precision: 'month',
        month,
        year,
      };
    case 'year':
      return {
        precision: 'year',
        year,
      };
    case 'range':
      return {
        precision: 'range',
        yearStart: year,
        yearEnd: yearEnd || year,
      };
    default:
      return null;
  }
};

const MemoryDateSelector = ({ value, onChange, required, className }: MemoryDateSelectorProps) => {
  const [precision, setPrecision] = useState<DatePrecision>(value?.precision || 'exact');
  const [date, setDate] = useState<Date | null>(value?.date || null);
  const [month, setMonth] = useState<number | undefined>(value?.month);
  const [year, setYear] = useState<number | undefined>(value?.year);
  const [yearStart, setYearStart] = useState<number | undefined>(value?.yearStart);
  const [yearEnd, setYearEnd] = useState<number | undefined>(value?.yearEnd);
  const [open, setOpen] = useState(false);

  // Sync internal state with value prop
  useEffect(() => {
    if (value) {
      setPrecision(value.precision);
      setDate(value.date || null);
      setMonth(value.month);
      setYear(value.year);
      setYearStart(value.yearStart);
      setYearEnd(value.yearEnd);
    }
  }, [value]);

  const updateValue = () => {
    let newValue: MemoryDateValue | null = null;

    switch (precision) {
      case 'exact':
        if (date) {
          newValue = { precision: 'exact', date };
        }
        break;
      case 'month':
        if (month && year) {
          newValue = { precision: 'month', month, year };
        }
        break;
      case 'year':
        if (year) {
          newValue = { precision: 'year', year };
        }
        break;
      case 'range':
        if (yearStart && yearEnd && yearStart <= yearEnd) {
          newValue = { precision: 'range', yearStart, yearEnd };
        }
        break;
    }

    onChange(newValue);
  };

  const handlePrecisionChange = (newPrecision: DatePrecision) => {
    setPrecision(newPrecision);
    // Reset values when precision changes
    if (newPrecision !== precision) {
      setDate(null);
      setMonth(undefined);
      setYear(undefined);
      setYearStart(undefined);
      setYearEnd(undefined);
      onChange(null);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate || null);
    if (selectedDate) {
      onChange({ precision: 'exact', date: selectedDate });
      setOpen(false);
    }
  };

  const handleMonthYearChange = (newMonth?: number, newYear?: number) => {
    const m = newMonth ?? month;
    const y = newYear ?? year;
    if (m) setMonth(m);
    if (y) setYear(y);
    if (m && y) {
      onChange({ precision: 'month', month: m, year: y });
    }
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    onChange({ precision: 'year', year: newYear });
  };

  const handleRangeChange = (start?: number, end?: number) => {
    const s = start ?? yearStart;
    const e = end ?? yearEnd;
    if (start !== undefined) setYearStart(start);
    if (end !== undefined) setYearEnd(end);
    if (s && e && s <= e) {
      onChange({ precision: 'range', yearStart: s, yearEnd: e });
    }
  };

  const clearValue = () => {
    setDate(null);
    setMonth(undefined);
    setYear(undefined);
    setYearStart(undefined);
    setYearEnd(undefined);
    onChange(null);
  };

  const displayValue = formatMemoryDate(value);

  const precisionLabels: Record<DatePrecision, string> = {
    exact: 'Date exacte',
    month: 'Mois / Année',
    year: 'Année',
    range: 'Période',
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Precision selector */}
      <div className="flex flex-wrap gap-2">
        {(['exact', 'month', 'year', 'range'] as DatePrecision[]).map((p) => (
          <Button
            key={p}
            type="button"
            variant={precision === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePrecisionChange(p)}
            className={cn(
              "text-xs",
              precision === p && "bg-primary text-primary-foreground"
            )}
          >
            {precisionLabels[p]}
          </Button>
        ))}
      </div>

      {/* Date input based on precision */}
      <div className="flex gap-2 items-start">
        {precision === 'exact' && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date || undefined}
                onSelect={handleDateSelect}
                disabled={(d) => d > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}

        {precision === 'month' && (
          <div className="flex-1 flex gap-2">
            <Select
              value={month?.toString()}
              onValueChange={(val) => handleMonthYearChange(parseInt(val, 10), undefined)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={year?.toString()}
              onValueChange={(val) => handleMonthYearChange(undefined, parseInt(val, 10))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {precision === 'year' && (
          <Select
            value={year?.toString()}
            onValueChange={(val) => handleYearChange(parseInt(val, 10))}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {precision === 'range' && (
          <div className="flex-1 flex gap-2 items-center">
            <Select
              value={yearStart?.toString()}
              onValueChange={(val) => handleRangeChange(parseInt(val, 10), undefined)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="De" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">à</span>
            <Select
              value={yearEnd?.toString()}
              onValueChange={(val) => handleRangeChange(undefined, parseInt(val, 10))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="À" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.filter(y => !yearStart || y >= yearStart).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearValue}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Display formatted value */}
      {displayValue && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarHeart className="w-4 h-4" />
          {displayValue}
        </p>
      )}
    </div>
  );
};

export default MemoryDateSelector;
