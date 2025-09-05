
'use client';

import type { Arrival } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Frown, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { format, parseISO, addMinutes, isSameDay } from 'date-fns';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

type ArrivalTimesProps = {
  arrivals: Arrival[];
};

const getStatusColor = (status: Arrival['status']) => {
  switch (status) {
    case 'On Time':
      return 'bg-green-500 hover:bg-green-600';
    case 'Delayed':
      return 'bg-red-500 hover:bg-red-600';
    case 'Early':
      return 'bg-yellow-500 hover:bg-yellow-600';
    default:
      return 'bg-secondary';
  }
};

const ArrivalTimeDisplay = ({ arrival }: { arrival: Arrival }) => {
  const [timeParts, period] = arrival.time.split(' ');
  const [hours, minutes] = timeParts.split(':').map(Number);

  let arrivalDateTime = parseISO(arrival.date);
  arrivalDateTime.setHours(hours);
  arrivalDateTime.setMinutes(minutes);

  return (
    <p className="text-sm text-muted-foreground flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {`Arriving at ${format(arrivalDateTime, 'p')}`}
    </p>
  );
};

export default function ArrivalTimes({ arrivals }: ArrivalTimesProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredArrivals = useMemo(() => {
    if (!selectedDate) return arrivals;
    return arrivals.filter((arrival) =>
      isSameDay(parseISO(arrival.date), selectedDate)
    );
  }, [arrivals, selectedDate]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Arrivals Time</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-sm text-muted-foreground">
        Real-time arrivals for your selected stop and date.
      </p>
      <div className="space-y-4">
        {filteredArrivals.length > 0 ? (
          filteredArrivals.map((arrival) => (
            <Card
              key={arrival.id}
              className="flex items-center p-4 justify-between transition-all hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <p className="font-bold text-lg">{arrival.route}</p>
                </div>
                <div>
                  <p className="font-semibold">{arrival.destination}</p>
                  <ArrivalTimeDisplay arrival={arrival} />
                </div>
              </div>
              <Badge className={cn('text-white', getStatusColor(arrival.status))}>
                {arrival.status}
              </Badge>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
            <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
            <h4 className="mt-4 text-lg font-semibold">No Arrivals Found</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no scheduled arrivals for the selected date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
