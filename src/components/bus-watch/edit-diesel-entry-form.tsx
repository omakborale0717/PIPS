
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
import { updateDieselEntry, getBusRoutesAction } from "@/app/actions";
import type { BusRoute, DieselEntry } from "@/lib/types";

const formSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required."),
  amount: z.coerce
    .number()
    .min(1, "Diesel amount must be greater than 0."),
  liters: z.coerce
    .number()
    .min(1, "Diesel liters must be greater than 0."),
  date: z.date({
    required_error: "A date is required.",
  }),
  pumpName: z.string().min(1, "Diesel pump name is required."),
  pageNumber: z.coerce.number().min(1, "Page number is required."),
});

type EditDieselEntryFormProps = {
    entry: DieselEntry;
    onEntryUpdated: (updatedEntry: DieselEntry) => void;
}

export default function EditDieselEntryForm({ entry, onEntryUpdated }: EditDieselEntryFormProps) {
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
      busNumber: entry.busNumber,
      amount: entry.amount,
      liters: entry.liters,
      date: entry.date ? parseISO(entry.date) : new Date(),
      pumpName: entry.pumpName,
      pageNumber: entry.pageNumber,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const updatedEntryData: DieselEntry = {
        ...entry,
        ...values,
        date: values.date.toISOString()
    };

    const result = await updateDieselEntry(updatedEntryData);
    setIsLoading(false);

    if (result.success) {
        toast({
            title: "Entry Updated",
            description: `Successfully updated the diesel entry.`
        });
        onEntryUpdated(result.data);
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
        <FormField
          control={form.control}
          name="busNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus Number</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
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
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Diesel Amount (₹)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 2500" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Diesel Liters</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
          control={form.control}
          name="pumpName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diesel Pump Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., City Fuel Center" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="pageNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Page Number in Book</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 12" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Refueling Date</FormLabel>
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
