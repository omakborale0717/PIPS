
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { updateStudent, getBusRoutesAction } from "@/app/actions";
import type { BusRoute, VillageFee, Student } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Student Name is required."),
  fatherName: z.string().min(1, "Father's Name is required."),
  class: z.string().min(1, "Class is required."),
  section: z.string().min(1, "Section is required."),
  village: z.string().min(1, "Village is required."),
  parentContact: z.string().min(1, "Parent's contact is required."),
  usesBus: z.boolean().default(false),
  busNumber: z.string().optional(),
  fees: z.coerce.number().optional(),
}).refine(data => {
    if (data.usesBus) {
        return !!data.busNumber;
    }
    return true;
}, {
    message: "Bus Number is required when student uses the bus.",
    path: ["busNumber"],
}).refine(data => {
    if (data.usesBus) {
        return data.fees !== undefined && data.fees >= 0;
    }
    return true;
}, {
    message: "Fees must be a positive number when student uses the bus.",
    path: ["fees"],
});


type EditStudentFormProps = {
  student: Student;
  villageFees: VillageFee[];
};

export default function EditStudentForm({ student, villageFees }: EditStudentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);

  useEffect(() => {
    async function fetchRoutes() {
      const routes = await getBusRoutesAction();
      setBusRoutes(routes);
    }
    fetchRoutes();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.name,
      fatherName: student.fatherName,
      class: student.class,
      section: student.section,
      village: student.village,
      parentContact: student.parentContact,
      usesBus: student.usesBus,
      busNumber: student.busNumber || "",
      fees: student.fees || 0,
    },
  });

  const usesBus = form.watch("usesBus");
  const village = form.watch("village");

  useEffect(() => {
    if (usesBus && village) {
      const fee = villageFees.find(f => f.villageName.toLowerCase() === village.toLowerCase());
      if (fee) {
        form.setValue("fees", fee.feeAmount);
      }
    }
  }, [usesBus, village, villageFees, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const studentData: Student = {
        id: student.id,
        ...values,
        busNumber: values.usesBus ? values.busNumber : undefined,
        fees: values.usesBus ? values.fees : 0,
    }

    const result = await updateStudent(studentData);
    setIsLoading(false);

    if (result.success) {
      toast({
          title: "Student Updated",
          description: `Successfully updated ${values.name}.`
      });
      router.push(`/dashboard/bus-management/${student.id}`);
      router.refresh();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Amit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Suresh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Class</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 5th" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Section</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., A" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

       <FormField
          control={form.control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a village" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {villageFees.map(fee => (
                    <SelectItem key={fee.id} value={fee.villageName}>{fee.villageName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent's Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="usesBus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Uses Bus Service</FormLabel>
                <FormDescription>
                  Enable if the student will be using the bus service.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {usesBus && (
          <>
            <FormField
                control={form.control}
                name="busNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Bus Number</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a bus for the student" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {busRoutes.map(route => (
                        <SelectItem key={route.id} value={route.busNumber}>{route.busNumber} ({route.driverName})</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Fees (₹)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 1200" {...field} />
                    </FormControl>
                     <FormDescription>
                        Fee is auto-filled if a fee is set for the student's village.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
