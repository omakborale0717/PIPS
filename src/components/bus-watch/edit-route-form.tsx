
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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
import type { BusRoute } from "@/lib/types";
import { updateBusRoute } from "@/app/actions";


const formSchema = z.object({
  driverName: z.string().min(1, "Driver Name is required."),
  route: z.string().min(1, "Route is required."),
  busNumber: z.string().min(1, "Bus number is required."),
  contact: z.string().min(1, "Contact is required."),
});

type EditRouteFormProps = {
    route: BusRoute;
    onRouteUpdated: (updatedRoute: BusRoute) => void;
}

export default function EditRouteForm({ route, onRouteUpdated }: EditRouteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverName: route.driverName,
      route: route.route,
      busNumber: route.busNumber,
      contact: route.contact,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const updatedRouteData: BusRoute = {
      ...route,
      ...values,
    };

    const result = await updateBusRoute(updatedRouteData);
    setIsLoading(false);

    if (result.success) {
        toast({
            title: "Route Updated",
            description: `Successfully updated the ${values.driverName} route.`
        });
        onRouteUpdated(result.data);
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
              <FormControl>
                <Input placeholder="e.g., MH12AB1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="driverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ramesh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="route"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Village A - School" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9876543210" {...field} />
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
