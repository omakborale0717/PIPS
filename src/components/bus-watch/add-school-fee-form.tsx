
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2, IndianRupee } from "lucide-react";
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
import type { SchoolFee } from "@/lib/types";

const formSchema = z.object({
  class: z.string().min(1, "Class name is required."),
  term1: z.coerce.number().min(0, "Term 1 fee must be a positive number."),
  term2: z.coerce.number().min(0, "Term 2 fee must be a positive number."),
});

type AddSchoolFeeFormProps = {
  onAddFee: (values: Omit<SchoolFee, 'id'>) => Promise<void>;
};

export default function AddSchoolFeeForm({ onAddFee }: AddSchoolFeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: "",
      term1: 0,
      term2: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const total = values.term1 + values.term2;
    await onAddFee({ ...values, total });
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nursery, 1st, UKG" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="term1"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Term 1 Fee</FormLabel>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="e.g., 10000" className="pl-8" {...field} />
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="term2"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Term 2 Fee</FormLabel>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="e.g., 10000" className="pl-8" {...field} />
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Fee Structure
          </Button>
        </div>
      </form>
    </Form>
  );
}
