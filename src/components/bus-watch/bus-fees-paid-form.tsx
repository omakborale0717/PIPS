
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, IndianRupee, User, Bus, Map, NotebookText, Home, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addBusFeePayment } from "@/app/actions";
import type { Student, BusRoute, BusFeesSettings, VillageFee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  studentId: z.string().min(1, "Student is required."),
  amountPaid: z.coerce.number().min(1, "Amount paid must be greater than 0."),
  paymentDate: z.date({ required_error: "A payment date is required." }),
  notes: z.string().optional(),
});

type BusFeesPaidFormProps = {
  students: Student[];
  busRoutes: BusRoute[];
  feeSettings: BusFeesSettings | null;
  villageFees: VillageFee[];
};

export default function BusFeesPaidForm({ students, busRoutes, feeSettings, villageFees }: BusFeesPaidFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      amountPaid: 0,
      paymentDate: new Date(),
      notes: "",
    },
  });

  const selectedStudentId = form.watch("studentId");

  const selectedStudentDetails = useMemo(() => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return null;
    
    const route = busRoutes.find(r => r.busNumber === student.busNumber);
    const villageFee = villageFees.find(vf => vf.villageName.toLowerCase() === student.village.toLowerCase());
    return {
      ...student,
      route: route?.route || 'N/A',
      villageFeeAmount: villageFee?.feeAmount
    };
  }, [selectedStudentId, students, busRoutes, villageFees]);

  useEffect(() => {
    if (selectedStudentDetails?.villageFeeAmount) {
        form.setValue("amountPaid", selectedStudentDetails.villageFeeAmount);
    } else if (feeSettings?.monthlyFee) {
        form.setValue("amountPaid", feeSettings.monthlyFee);
    }
  }, [selectedStudentDetails, feeSettings, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await addBusFeePayment(values);
    setIsLoading(false);

    if (result.success) {
        toast({
            title: "Payment Logged",
            description: `Successfully logged payment for student.`
        });
        form.reset();
        router.push(`/dashboard/bus-management/${values.studentId}`); 
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Student</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.class} '{student.section}')
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />

        {selectedStudentDetails && (
            <Card className="bg-muted/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                   <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Class:</span>
                        <span className="font-medium">{selectedStudentDetails.class} '{selectedStudentDetails.section}'</span>
                   </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Village:</span>
                        <span className="font-medium">{selectedStudentDetails.village}</span>
                         {selectedStudentDetails.villageFeeAmount !== undefined && (
                            <span className="flex items-center gap-1 font-semibold text-primary ml-auto">
                                (Fee: <IndianRupee className="h-3.5 w-3.5" />{selectedStudentDetails.villageFeeAmount.toLocaleString()})
                            </span>
                        )}
                   </div>
                   <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bus:</span>
                        <span className="font-medium">{selectedStudentDetails.busNumber || "N/A"}</span>
                   </div>
                    <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">{selectedStudentDetails.route}</span>
                   </div>
                </CardContent>
            </Card>
        )}
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount Paid</FormLabel>
                     <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 1200" className="pl-8" {...field} />
                    </div>
                    {feeSettings && !selectedStudentDetails?.villageFeeAmount && feeSettings.monthlyFee && <p className="text-xs text-muted-foreground pt-1">Default fee is ₹{feeSettings.monthlyFee.toLocaleString()}</p>}
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Notes / Remarks</FormLabel>
                 <div className="relative">
                    <NotebookText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Paid for month of July" {...field} className="pl-8" />
                </div>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end pt-4">
           <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
