

import {
  Card,
  CardContent,
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
import { getBusRoutesAction } from '@/app/actions';
import type { BusRoute } from '@/lib/types';

export default async function DieselManagementPage() {
  const busRoutes: BusRoute[] = await getBusRoutesAction();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Diesel Management</CardTitle>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
