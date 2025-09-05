
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { ServiceHistory, BusRoute } from "@/lib/types";
import { useState } from "react";

const formSchema = z.object({
  date: z.date({ required_error: "A service date is required." }),
  machineName: z.string().min(1, "Machine name is required."),
  contactNumber: z.string().min(1, "Contact number is required."),
  labourCharge: z.coerce.number().min(0, "Labour charge must be a positive number."),
  totalRepairCharge: z.coerce.number().min(0, "Repair charge must be a positive number."),
  remark: z.string().min(1, "Remark is required."),
});

type EditRepairFormProps = {
  onUpdateRepair: (busId: string, data: ServiceHistory) => void;
  bus: BusRoute;
  history: ServiceHistory;
};

export default function EditRepairForm({ onUpdateRepair, bus, history }: EditRepairFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: parseISO(history.date),
      machineName: history.machineName,
      contactNumber: history.contactNumber,
      labourCharge: history.labourCharge,
      totalRepairCharge: history.totalRepairCharge,
      remark: history.remark,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const updatedHistory: ServiceHistory = {
      ...history,
      ...values,
      date: values.date.toISOString(),
    };
    await onUpdateRepair(bus.id, updatedHistory);
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div className="p-4 bg-muted/50 rounded-md mb-4">
            <p className="font-semibold">Editing repair for Bus: <span className="text-primary">{bus.busNumber}</span></p>
        </div>
        <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Service Date</FormLabel>
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
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="machineName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Machine Name / Part</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Brake Pads" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Mechanic Contact Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="labourCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour Charge (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalRepairCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repair Charge (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the work that was done."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

    