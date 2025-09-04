
"use client";

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { BookUser, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import type { SchoolFee } from '@/lib/types';
import AddSchoolFeeForm from './add-school-fee-form';
import { toast } from '@/hooks/use-toast';
import { addSchoolFeeAction } from '@/app/actions';

type SchoolFeesClientProps = {
  initialFees: SchoolFee[];
};

export default function SchoolFeesClient({ initialFees }: SchoolFeesClientProps) {
  const [fees, setFees] = useState<SchoolFee[]>(initialFees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddFee = async (values: Omit<SchoolFee, 'id'>) => {
    const result = await addSchoolFeeAction(values);
    if (result.success) {
      setFees(prev => [...prev, result.data]);
      toast({
        title: 'School Fee Added',
        description: `Successfully added fee for ${values.class}.`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookUser className="h-5 w-5 text-primary" />
              School Fees Structure
            </CardTitle>
            <CardDescription>
              Fee structure based on class for the academic year.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Class Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New School Fee</DialogTitle>
                <DialogDescription>
                  Set the fee structure for a specific class.
                </DialogDescription>
              </DialogHeader>
              <AddSchoolFeeForm onAddFee={handleAddFee} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Term 1 (₹)</TableHead>
                <TableHead className="text-right">Term 2 (₹)</TableHead>
                <TableHead className="text-right">Total School Fees (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map(fee => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.class}</TableCell>
                  <TableCell className="text-right">{fee.term1.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.term2.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{fee.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {fees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No school fee structures have been added yet.
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
