import { useState } from 'react';
import { CalendarClock, Clock, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface ScheduleSelectorProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
}

const ScheduleSelector = ({ scheduledAt, onChange }: ScheduleSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(scheduledAt ? format(scheduledAt, 'HH:mm') : '09:00');

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(date);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (scheduledAt) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(scheduledAt);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const clearSchedule = () => {
    onChange(null);
    setOpen(false);
  };

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium flex items-center gap-2">
        <CalendarClock className="w-4 h-4" />
        Programmer la publication
      </Label>
      
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !scheduledAt && "text-muted-foreground"
              )}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              {scheduledAt ? (
                format(scheduledAt, "PPP 'à' HH:mm", { locale: fr })
              ) : (
                "Choisir une date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduledAt || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < tomorrow}
              initialFocus
              locale={fr}
            />
            <div className="p-3 border-t">
              <Label className="text-sm flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3" />
                Heure de publication
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>

        {scheduledAt && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSchedule}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {scheduledAt && (
        <p className="text-sm text-muted-foreground">
          La capsule sera automatiquement publiée le{' '}
          {format(scheduledAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </p>
      )}
    </div>
  );
};

export default ScheduleSelector;
