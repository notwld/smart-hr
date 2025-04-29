"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import LeaveApplicationForm from "@/components/leaves/LeaveApplicationForm";

export default function ApplyLeavePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Apply for Leave</h1>
          <p className="text-gray-500 mt-1">Submit your leave request for approval</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveApplicationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 