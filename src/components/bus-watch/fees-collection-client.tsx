
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
  Bus,
  Receipt,
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
import type { Student, SchoolFee, VillageFee, BusFeePayment } from '@/lib/types';
import { addBusFeePayment } from '@/app/actions';
import { Label } from '@/components/ui/label';

const searchSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'),
  academicYear: z.string(),
});

type FeeDetails = {
  id: string;
  name: string;
  totalAmount: number;
  dueAmount: number;
  paidAmount: number;
  balance: number;
  class?: string;
  village?: string;
};

// A fee category can be 'school', 'bus', or 'fine'
// Redefining a simple version here as the main one from types.ts was removed.
type FeeCategory = {
    id: string;
    name: string;
    totalAmount: number;
}


type FeesCollectionClientProps = {
  students: Student[];
  payments: BusFeePayment[];
  schoolFees: SchoolFee[];
  villageFees: VillageFee[];
  otherFeeCategories: FeeCategory[];
};

export default function FeesCollectionClient({
  students,
  payments,
  schoolFees,
  villageFees,
  otherFeeCategories,
}: FeesCollectionClientProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState<FeeDetails[]>([]);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [amountToPay, setAmountToPay] = useState(0);

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      studentId: '',
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
  
  const handleFeeDetailChange = (index: number, field: 'class' | 'village', value: string) => {
    const newDetails = [...studentFeeDetails];
    const detail = newDetails[index];
    
    if (detail.id === 'school' && field === 'class') {
      const schoolFee = schoolFees.find(sf => sf.class === value);
      detail.totalAmount = schoolFee ? schoolFee.total : 0;
    }
    
    if (detail.id === 'bus' && field === 'village') {
       const villageFee = villageFees.find(vf => vf.villageName === value);
       detail.totalAmount = villageFee ? villageFee.feeAmount : 0;
    }
    
    const balance = detail.totalAmount - detail.paidAmount;
    detail.balance = balance;
    detail.dueAmount = balance > 0 ? balance : 0;

    if (field === 'class') detail.class = value;
    if (field === 'village') detail.village = value;

    setStudentFeeDetails(newDetails);
  };


  const handleSearch = (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    const student = students.find((s) => s.id === values.studentId);

    setTimeout(() => {
      if (student) {
        setSelectedStudent(student);
        const studentPayments = getStudentPayments(student.id);
        
        const schoolFeeAmount = schoolFees.find(sf => sf.class === student.class)?.total || 0;
        const busFeeAmount = student.usesBus ? (villageFees.find(vf => vf.villageName === student.village)?.feeAmount || 0) : 0;
        const busPaidAmount = studentPayments.reduce((acc, p) => acc + p.amountPaid, 0);

        const feeCategories: FeeCategory[] = [
            { id: 'school', name: 'School Fees', totalAmount: schoolFeeAmount },
            { id: 'bus', name: 'Bus Fees', totalAmount: busFeeAmount },
            ...otherFeeCategories,
        ];
        
        const details = feeCategories.map((cat) => {
          let paidAmount = 0;
          if (cat.id === 'bus') {
            paidAmount = busPaidAmount;
          }
          // Placeholder for school fees paid
          if (cat.id === 'school') paidAmount = 0; 

          const balance = cat.totalAmount - paidAmount;
          return {
            id: cat.id,
            name: cat.name,
            totalAmount: cat.totalAmount,
            paidAmount,
            dueAmount: balance > 0 ? balance : 0,
            balance: balance,
            class: student.class,
            village: student.village,
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
          description: 'No student found with that name.',
        });
      }
      setIsSearching(false);
    }, 500);
  };

  const handleReset = () => {
    searchForm.reset({studentId: '', academicYear: searchForm.getValues('academicYear')});
    setSelectedStudent(null);
    setStudentFeeDetails([]);
    setSelectedFeeIds([]);
    setSelectedClass('all');
    setReceiptNumber('');
    setAmountToPay(0);
  };

  const totalPayable = useMemo(() => {
    return studentFeeDetails
      .filter((fee) => selectedFeeIds.includes(fee.id))
      .reduce((acc, fee) => acc + fee.dueAmount, 0);
  }, [studentFeeDetails, selectedFeeIds]);

  const totalFees = useMemo(() => {
    return studentFeeDetails.reduce((acc, fee) => acc + fee.totalAmount, 0);
  }, [studentFeeDetails]);


  useEffect(() => {
    setAmountToPay(totalPayable);
  }, [totalPayable]);


  const handlePaymentSubmit = async () => {
    if (totalPayable <= 0) {
      toast({
        variant: 'destructive',
        title: 'No Amount to Pay',
        description: 'Please select fees with a due amount to make a payment.',
      });
      return;
    }
    if (!selectedStudent) return;

    // We'll just log bus fee payments for now, as that's what we have a model for.
    const busFeeSelected = studentFeeDetails.find(fee => selectedFeeIds.includes(fee.id) && fee.id === 'bus');

    if (busFeeSelected) {
        const result = await addBusFeePayment({
            studentId: selectedStudent.id,
            amountPaid: amountToPay, // Using the state value from the input
            paymentDate: new Date(),
            notes: `Receipt No: ${receiptNumber}`
        });
        if (result.success) {
             toast({
                title: 'Payment Submitted',
                description: `Payment of ₹${amountToPay.toLocaleString()} for ${selectedStudent?.name} has been recorded.`,
            });
            // Refetch or update data locally
        } else {
             toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: result.error,
            });
        }
    } else {
         toast({
            title: 'Payment Submitted (Demo)',
            description: `Payment of ₹${amountToPay.toLocaleString()} for ${selectedStudent?.name} has been recorded. (Non-bus fees are not saved in this demo)`,
        });
    }

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
      case 'school fees': return <Info className="h-4 w-4 text-blue-500" />;
      case 'bus fees': return <Bus className="h-4 w-4 text-green-500" />;
      default: return <IndianRupee className="h-4 w-4 text-muted-foreground" />;
    }
  }

  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const startYear = new Date().getFullYear() - 2 + i;
    return `${startYear}/${(startYear + 1).toString().slice(2)}`;
  });
  
  const uniqueClasses = ['all', ...Array.from(new Set(students.map(s => s.class)))];
  const uniqueVillages = [...Array.from(new Set(students.map(s => s.village)))];

  
  const filteredStudents = useMemo(() => {
      if(selectedClass === 'all') return students;
      return students.filter(s => s.class === selectedClass);
  }, [students, selectedClass]);


  return (
    <div className="space-y-6">
      <Form {...searchForm}>
        <form
          onSubmit={searchForm.handleSubmit(handleSearch)}
          className="p-4 border rounded-lg bg-muted/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
             <FormItem>
              <FormLabel>Class</FormLabel>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  searchForm.reset({ ...searchForm.getValues(), studentId: '' });
                  setSelectedStudent(null);
                  setStudentFeeDetails([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.filter(c => c !== 'all').map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            <FormField
              control={searchForm.control}
              name="studentId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Student Name</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.fatherName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div className="md:col-span-1 flex gap-2">
              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Search />
                )}
                <span className="ml-2">Search</span>
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
                    <TableHead>Class</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {studentFeeDetails.map((fee, index) => (
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
                    <TableCell>
                        <Select
                            value={fee.class}
                            onValueChange={(value) => handleFeeDetailChange(index, 'class', value)}
                            disabled={fee.id !== 'school'}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueClasses.filter(c => c !== 'all').map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                     <TableCell>
                        <Select
                            value={fee.village}
                             onValueChange={(value) => handleFeeDetailChange(index, 'village', value)}
                            disabled={fee.id !== 'bus'}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select Village" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueVillages.map(v => (
                                    <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-md">
                 <div>
                  <Label htmlFor="receipt-number">Receipt Number</Label>
                  <div className="relative mt-2">
                     <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="receipt-number"
                      placeholder="Enter receipt no."
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                    <Label>Total Fees</Label>
                    <p className="text-2xl font-bold mt-1">₹{totalFees.toLocaleString()}</p>
                </div>

                <div>
                    <Label htmlFor="amount-to-pay">Amount to Pay</Label>
                    <div className="relative mt-2">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="amount-to-pay"
                        type="number"
                        placeholder="Enter amount"
                        value={amountToPay}
                        onChange={(e) => setAmountToPay(Number(e.target.value))}
                        className="pl-8 text-lg font-semibold"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button onClick={handlePaymentSubmit} disabled={amountToPay <= 0} className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        Submit Payment
                    </Button>
                    <Button onClick={handleGenerateReceipt} variant="outline" disabled={amountToPay <= 0} className="w-full sm:w-auto">
                        <Printer className="mr-2 h-4 w-4" />
                        Generate Receipt
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
