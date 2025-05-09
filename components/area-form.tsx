"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
// import { createArea, updateArea } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  area_id: z.string().min(2, {
    message: "Area ID must be at least 2 characters.",
  }),
});

type Area = {
  _id: string;
  name: string;
  area_id: string;
  drones: string[];
};

interface AreaFormProps {
  area?: Area;
}

export function AreaForm({ area }: AreaFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: area?.name || "",
      area_id: area?.area_id || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // try {
    //   if (area) {
    //     // Update existing area
    //     await updateArea({
    //       _id: area._id,
    //       ...values,
    //     });
    //     toast({
    //       title: "Area updated",
    //       description: "The area has been updated successfully.",
    //     });
    //   } else {
    //     // Create new area
    //     await createArea(values);
    //     toast({
    //       title: "Area created",
    //       description: "The new area has been created successfully.",
    //     });
    //   }

    //   router.push("/");
    //   router.refresh();
    // } catch (error) {
    //   console.error("Form submission error:", error);
    //   toast({
    //     title: "Error",
    //     description: "There was a problem saving the area.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter area name" {...field} />
              </FormControl>
              <FormDescription>The display name for this area.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter unique area ID"
                  {...field}
                  disabled={!!area}
                />
              </FormControl>
              <FormDescription>
                A unique identifier for this area.{" "}
                {area && "Cannot be changed after creation."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : area ? "Update Area" : "Create Area"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
