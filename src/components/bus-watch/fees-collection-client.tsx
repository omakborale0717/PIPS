
'use client';

import { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Search,
  Loader2,
  IndianRupee,
  Save,
  Printer,
  RotateCcw,
  User,
  Info,
  BadgePercent,
  Bus,
  StickyNote,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Student, BusFeePayment } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const searchSchema = z.object({
  admissionNo: z.string().min(1, 'Admission number is required.'),
  academicYear: z.string(),
});

type FeeCategory = {
  id: string;
  name: string;
  totalAmount: number;
};

type FeeDetails = {
  id: string;
  name: string;
  totalAmount: number;
  dueAmount: number;
  paidAmount: number;
  balance: number;
};

type FeesCollectionClientProps = {
  students: Student[];
  payments: BusFeePayment[];
  feeCategories: FeeCategory[];
};

export default function FeesCollectionClient({
  students,
  payments,
  feeCategories,
}: FeesCollectionClientProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState<FeeDetails[]>([]);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [narration, setNarration] = useState('');

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      admissionNo: '',
      academicYear: `${new Date().getFullYear()}/${(
        new Date().getFullYear() + 1
      )
        .toString()
        .slice(2)}`,
    },
  });

  const getStudentPayments = (studentId: string) => {
    return payments.filter((p) => p.studentId === studentId);
  };

  const handleSearch = (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    // In a real app, you might use the admission number to query the backend
    const student = students.find((s) => s.id === values.admissionNo); // Assuming id is admission no for now

    setTimeout(() => {
      if (student) {
        setSelectedStudent(student);
        const studentPayments = getStudentPayments(student.id);

        const details = feeCategories.map((cat) => {
          let paidAmount = 0;
          if (cat.id === 'bus') {
            paidAmount = studentPayments.reduce(
              (acc, p) => acc + p.amountPaid,
              0
            );
          }
          // Placeholder logic for other categories
          if (cat.id === 'tuition') paidAmount = 10000;

          const balance = cat.totalAmount - paidAmount;
          return {
            id: cat.id,
            name: cat.name,
            totalAmount: cat.totalAmount,
            paidAmount,
            dueAmount: balance > 0 ? balance : 0, // Simplified due logic
            balance: balance,
          };
        });
        setStudentFeeDetails(details);
        toast({ title: 'Student Found', description: `Displaying details for ${student.name}` });
      } else {
        setSelectedStudent(null);
        setStudentFeeDetails([]);
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: 'No student found with that admission number.',
        });
      }
      setIsSearching(false);
    }, 500);
  };

  const handleReset = () => {
    searchForm.reset();
    setSelectedStudent(null);
    setStudentFeeDetails([]);
    setSelectedFeeIds([]);
    setNarration('');
  };

  const totalPayable = useMemo(() => {
    return studentFeeDetails
      .filter((fee) => selectedFeeIds.includes(fee.id))
      .reduce((acc, fee) => acc + fee.dueAmount, 0);
  }, [studentFeeDetails, selectedFeeIds]);

  const handlePaymentSubmit = () => {
    if (totalPayable <= 0) {
      toast({
        variant: 'destructive',
        title: 'No Amount to Pay',
        description: 'Please select fees with a due amount to make a payment.',
      });
      return;
    }
    // In a real app, this would call a server action
    console.log({
      studentId: selectedStudent?.id,
      amountPaid: totalPayable,
      feesPaidFor: selectedFeeIds,
      narration,
    });
    toast({
      title: 'Payment Submitted (Demo)',
      description: `Payment of ₹${totalPayable.toLocaleString()} for ${selectedStudent?.name} has been recorded.`,
    });
  };

  const handleGenerateReceipt = () => {
     if (totalPayable <= 0) {
      toast({
        variant: 'destructive',
        title: 'No Amount to Pay',
        description: 'Please select fees to generate a receipt.',
      });
      return;
    }
    toast({
      title: 'Receipt Generated (Demo)',
      description: 'A receipt has been printed for this transaction.',
    });
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'tuition fees': return <Info className="h-4 w-4 text-blue-500" />;
      case 'bus fees': return <Bus className="h-4 w-4 text-green-500" />;
      case 'fine': return <BadgePercent className="h-4 w-4 text-red-500" />;
      case 'remark': return <StickyNote className="h-4 w-4 text-yellow-500" />;
      default: return <IndianRupee className="h-4 w-4 text-muted-foreground" />;
    }
  }

  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const startYear = new Date().getFullYear() - 2 + i;
    return `${startYear}/${(startYear + 1).toString().slice(2)}`;
  });

  return (
    <div className="space-y-6">
      <Form {...searchForm}>
        <form
          onSubmit={searchForm.handleSubmit(handleSearch)}
          className="p-4 border rounded-lg bg-muted/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <FormField
              control={searchForm.control}
              name="admissionNo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Admission No / Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter admission no. or name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={searchForm.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Search />
                )}
                <span className="ml-2">Search Fees</span>
              </Button>
               <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw />
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {selectedStudent && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission No</p>
                  <p className="font-medium">{selectedStudent.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Father's Name</p>
                  <p className="font-medium">{selectedStudent.fatherName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class & Sec</p>
                  <p className="font-medium">
                    {selectedStudent.class} '{selectedStudent.section}'
                  </p>
                </div>
                 <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Fee Categories</CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">
                    <Checkbox
                        checked={selectedFeeIds.length === studentFeeDetails.filter(f => f.dueAmount > 0).length && studentFeeDetails.filter(f => f.dueAmount > 0).length > 0}
                        onCheckedChange={(checked) => {
                        setSelectedFeeIds(
                            checked ? studentFeeDetails.filter(f => f.dueAmount > 0).map((fee) => fee.id) : []
                        );
                        }}
                    />
                    </TableHead>
                    <TableHead>Fees Category</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {studentFeeDetails.map((fee) => (
                    <TableRow key={fee.id}>
                    <TableCell>
                        <Checkbox
                        checked={selectedFeeIds.includes(fee.id)}
                        disabled={fee.dueAmount <= 0}
                        onCheckedChange={(checked) => {
                            setSelectedFeeIds(
                            checked
                                ? [...selectedFeeIds, fee.id]
                                : selectedFeeIds.filter((id) => id !== fee.id)
                            );
                        }}
                        />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                        {getCategoryIcon(fee.name)}
                        {fee.name}
                    </TableCell>
                    <TableCell className="text-right">
                        {fee.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                        {fee.dueAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                        {fee.paidAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                        {fee.balance.toLocaleString()}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
          </Card>
          
          <Alert>
              <IndianRupee className="h-4 w-4" />
              <AlertTitle>Payment Summary</AlertTitle>
              <AlertDescription className="grid grid-cols-2 gap-4 mt-2">
                 <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Total Payable Amount</span>
                    <span className="text-lg font-bold text-primary">₹{totalPayable.toLocaleString()}</span>
                </div>
                 <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Balance After Payment</span>
                    <span className="text-lg font-bold">₹{(studentFeeDetails.reduce((acc, fee) => acc + fee.balance, 0) - totalPayable).toLocaleString()}</span>
                </div>
              </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <div className="space-y-2">
                <Label htmlFor="narration">Narration / Remarks</Label>
                <Input 
                    id="narration"
                    placeholder="Enter any payment remarks..."
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-end pt-6">
              <Button onClick={handlePaymentSubmit} disabled={totalPayable <= 0}>
                <Save />
                Submit Payment
              </Button>
              <Button onClick={handleGenerateReceipt} variant="outline" disabled={totalPayable <= 0}>
                <Printer />
                Generate Receipt
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
