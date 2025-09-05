

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, Bus } from 'lucide-react';
import { getStudentsAction, getBusFeePaymentsAction, getBusRoutesAction } from '@/app/actions';
import BusManagementClient from '@/components/bus-watch/bus-management-client';
import type { Student } from '@/lib/types';

export type StudentWithPaidFees = Student & { totalPaid: number; balance: number };


export default async function BusManagementPage() {
  const students = await getStudentsAction();
  const payments = await getBusFeePaymentsAction();
  const busRoutes = await getBusRoutesAction();

  const totalStudents = students.length;
  const activeBuses = busRoutes.length;

  const studentsWithPaidFees: StudentWithPaidFees[] = students.map(student => {
    const studentPayments = payments.filter(p => p.studentId === student.id);
    const totalPaid = studentPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    const balance = (student.fees || 0) - totalPaid;
    return { ...student, totalPaid, balance };
  });

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              students in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Buses
            </CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{activeBuses}</div>
            <p className="text-xs text-muted-foreground">
              Click "Routes" to see bus details
            </p>
          </CardContent>
        </Card>
      </div>
      <BusManagementClient students={studentsWithPaidFees} />
    </main>
  );
}
