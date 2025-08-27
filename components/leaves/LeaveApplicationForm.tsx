"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ButtonLoader, OverlayLoader } from "@/components/ui/loader";
import { Calendar, Clock, AlertCircle, Plus } from "lucide-react";

const leaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  type: z.enum(["SICK", "VACATION", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"]),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

export default function LeaveApplicationForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      type: "VACATION",
      reason: "",
    },
  });

  const onSubmit = async (data: LeaveFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message.includes("team")) {
          throw new Error(error.message);
        } else {
          throw new Error(error.message || "Failed to submit leave request");
        }
      }

      toast.success("Leave request submitted successfully! Awaiting team leader and admin approval.");
      router.push("/leaves");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error submitting leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && <OverlayLoader text="Submitting your leave request..." />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Select Leave Dates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={form.watch("startDate") || new Date().toISOString().split('T')[0]}
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Leave Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Leave Details
            </h3>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-green-500 transition-colors">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SICK">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Sick Leave
                        </div>
                      </SelectItem>
                      <SelectItem value="VACATION">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Vacation
                        </div>
                      </SelectItem>
                      <SelectItem value="PERSONAL">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          Personal Leave
                        </div>
                      </SelectItem>
                      <SelectItem value="MATERNITY">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          Maternity Leave
                        </div>
                      </SelectItem>
                      <SelectItem value="PATERNITY">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Paternity Leave
                        </div>
                      </SelectItem>
                      <SelectItem value="UNPAID">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          Unpaid Leave
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Reason */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Reason for Leave
            </h3>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed reason for your leave request..."
                      {...field}
                      className="min-h-[100px] border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="h-11 px-8 border-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200"
            >
              {loading ? (
                <>
                  <ButtonLoader size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Leave Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 