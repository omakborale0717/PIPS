
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
import type { FeeCategory } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, "Category name is required."),
  defaultAmount: z.coerce.number().min(0, "Amount must be a positive number."),
});

type EditFeeCategoryFormProps = {
    category: FeeCategory;
    onUpdateCategory: (values: FeeCategory) => Promise<void>;
};

export default function EditFeeCategoryForm({ category, onUpdateCategory }: EditFeeCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      defaultAmount: category.defaultAmount,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const updatedCategory: FeeCategory = {
        ...category,
        ...values
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
        <FormField
          control={form.control}
          name="defaultAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Amount (₹)</FormLabel>
               <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" placeholder="e.g., 500" className="pl-8" {...field} />
              </div>
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
