
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
import type { FeeCategory, SchoolFee, VillageFee } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const formSchema = z.object({
  name: z.string().min(1, "Category name is required."),
  term1: z.coerce.number().min(0, "Amount must be a positive number."),
  term2: z.coerce.number().min(0, "Amount must be a positive number."),
  class: z.string().optional(),
  village: z.string().optional(),
});

type EditFeeCategoryFormProps = {
    category: FeeCategory;
    onUpdateCategory: (values: FeeCategory) => Promise<void>;
    schoolFees: SchoolFee[];
    villageFees: VillageFee[];
};

export default function EditFeeCategoryForm({ category, onUpdateCategory, schoolFees, villageFees }: EditFeeCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      term1: category.term1,
      term2: category.term2,
      class: category.class || "all-classes",
      village: category.village || "all-villages",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const updatedCategory: FeeCategory = {
        ...category,
        ...values,
        class: values.class === 'all-classes' ? undefined : values.class,
        village: values.village === 'all-villages' ? undefined : values.village,
    };
    await onUpdateCategory(updatedCategory);
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fine, Lab Fee" {...field} />
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
                <FormLabel>Term 1 (₹)</FormLabel>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="e.g., 500" className="pl-8" {...field} />
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
                <FormLabel>Term 2 (₹)</FormLabel>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="e.g., 500" className="pl-8" {...field} />
                </div>
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
                  <FormLabel>Class (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all-classes">All classes</SelectItem>
                      {schoolFees.map(fee => (
                        <SelectItem key={fee.id} value={fee.class}>{fee.class}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All villages" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="all-villages">All villages</SelectItem>
                      {villageFees.map(fee => (
                        <SelectItem key={fee.id} value={fee.villageName}>{fee.villageName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
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
