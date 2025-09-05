
"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, isSameDay } from 'date-fns';
import type { BusRoute, DieselEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

type DieselManagementClientProps = {
  busRoutes: BusRoute[];
  dieselEntries: DieselEntry[];
};

export default function DieselManagementClient({ busRoutes, dieselEntries }: DieselManagementClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredDieselEntries = useMemo(() => {
    if (!selectedDate) {
      return dieselEntries;
    }
    return dieselEntries.filter(entry => 
      entry.date && isSameDay(parseISO(entry.date), selectedDate)
    );
  }, [dieselEntries, selectedDate]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bus Fuel Levels</CardTitle>
          <CardDescription>An overview of the current fuel levels in each bus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Fuel Level</TableHead>
                <TableHead>Last Refueled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {busRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.busNumber}</TableCell>
                  <TableCell>{route.driverName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={route.fuelLevel || 0} className="w-32" />
                      <span>{route.fuelLevel || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     {route.lastFueled ? format(parseISO(route.lastFueled), 'PPP') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
               {busRoutes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No bus routes found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Diesel Refueling Log</CardTitle>
            <CardDescription>
              A log of all diesel refueling events. Filter by date.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button asChild>
              <Link href="/dashboard/diesel-entry">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bus Number</TableHead>
                <TableHead>Diesel Pump Name</TableHead>
                <TableHead>Liters Added</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Page Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDieselEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(parseISO(entry.date), 'PPP')}</TableCell>
                  <TableCell className="font-medium">
                    {entry.busNumber}
                  </TableCell>
                  <TableCell>{entry.pumpName}</TableCell>
                  <TableCell>{entry.liters.toFixed(2)}</TableCell>
                  <TableCell>{entry.amount.toLocaleString()}</TableCell>
                  <TableCell>{entry.pageNumber}</TableCell>
                </TableRow>
              ))}
              {filteredDieselEntries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No diesel entries found for the selected date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
