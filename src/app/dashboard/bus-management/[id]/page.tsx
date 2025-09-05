

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, User, Bus, School, IndianRupee, MapPin, Banknote, UserSquare, ArrowLeft, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Student } from '@/lib/types';
import { getStudentsAction, getBusFeePaymentsAction } from '@/app/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const allStudents = await getStudentsAction();
  const allPayments = await getBusFeePaymentsAction();
  
  const student = allStudents.find((s) => s.id === studentId);

  if (!student) {
    notFound();
  }

  const studentPayments = allPayments.filter(p => p.studentId === studentId);
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amountPaid, 0);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard/bus-management">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Student Details</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Student Details</h1>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="outline">
                <Link href={`/dashboard/bus-management/${student.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
            </Button>
            {/* We can add a client component for delete confirmation here later */}
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-3xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl">{student.name}</CardTitle>
              <CardDescription>
                Detailed information for {student.name}.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium">{student.fatherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{student.class} '{student.section}'</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bus className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bus Number</p>
                  <p className="font-medium">{student.busNumber || 'N/A'}</p>
                </div>
              </div>
               <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fees (₹)</p>
                  <p className="font-medium">{student.fees?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
               <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Village</p>
                  <p className="font-medium">{student.village || 'N/A'}</p>
                </div>
              </div>
               <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Parent's Contact</p>
                  <p className="font-medium">{student.parentContact || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Fee Payment History
            </CardTitle>
            <CardDescription>A record of all bus fee payments made by {student.name}.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount Paid (₹)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentDate ? format(parseISO(payment.paymentDate), 'PPP') : 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        {payment.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>{payment.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {studentPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No payment history found for this student.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {studentPayments.length > 0 && (
                <>
                    <Separator className="my-4" />
                    <div className="flex justify-end items-center font-bold text-lg pr-4">
                        <span className="text-muted-foreground mr-2">Total Paid:</span>
                        <span>₹{totalPaid.toLocaleString()}</span>
                    </div>
                </>
              )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
