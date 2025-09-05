

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { format, parseISO } from 'date-fns';
import { getBusRoutesAction, getDieselEntriesAction } from '@/app/actions';
import type { BusRoute } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function DieselManagementPage() {
  const busRoutes: BusRoute[] = await getBusRoutesAction();
  const dieselEntries = await getDieselEntriesAction();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
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
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Diesel Refueling Log</CardTitle>
            <CardDescription>
              A log of all diesel refueling events.
            </CardDescription>
          </div>
           <Button asChild>
            <Link href="/dashboard/diesel-entry">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Diesel Entry
            </Link>
          </Button>
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
              {dieselEntries.map((entry) => (
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
              {dieselEntries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No diesel entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
