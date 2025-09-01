"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LeaveApplicationForm from "@/components/leaves/LeaveApplicationForm";
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface LeaveStats {
  totalLeaveDays: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
  pendingRequests: number;
  approvedThisYear: number;
  leaveTypesUsed: {
    SICK: number;
    VACATION: number;
    PERSONAL: number;
    MATERNITY: number;
    PATERNITY: number;
    UNPAID: number;
  };
}

export default function ApplyLeavePage() {
  const router = useRouter();
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveStats();
  }, []);

  const fetchLeaveStats = async () => {
    try {
      const response = await fetch("/api/leaves/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 404) {
        // API doesn't exist yet, show default stats
        setStats({
          totalLeaveDays: 25,
          usedLeaveDays: 0,
          remainingLeaveDays: 25,
          pendingRequests: 0,
          approvedThisYear: 0,
          leaveTypesUsed: {
            SICK: 0,
            VACATION: 0,
            PERSONAL: 0,
            MATERNITY: 0,
            PATERNITY: 0,
            UNPAID: 0,
          },
        });
      } else {
        toast.error("Failed to load leave statistics");
      }
    } catch (error) {
      console.error("Error fetching leave stats:", error);
      // Set default stats on error
      setStats({
        totalLeaveDays: 25,
        usedLeaveDays: 0,
        remainingLeaveDays: 25,
        pendingRequests: 0,
        approvedThisYear: 0,
        leaveTypesUsed: {
          SICK: 0,
          VACATION: 0,
          PERSONAL: 0,
          MATERNITY: 0,
          PATERNITY: 0,
          UNPAID: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader size="lg" text="Loading leave information..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 max-w-2xl mx-auto">
            <CardHeader className="text-white text-center">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <Calendar className="w-8 h-8" />
                Apply for Leave
              </CardTitle>
              <p className="text-white/90 mt-1">Submit your leave request for approval</p>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Leave Statistics */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1 uppercase tracking-wide">Total Leave Days</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-800">{stats.totalLeaveDays}</p>
                      <p className="text-xs text-blue-600 mt-1">Annual allocation</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-200 rounded-full flex items-center justify-center ml-3">
                      <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-orange-600 mb-1 uppercase tracking-wide">Days Used</p>
                      <p className="text-2xl lg:text-3xl font-bold text-orange-800">{stats.usedLeaveDays}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 mr-1" />
                        <span className="text-xs text-orange-600">
                          {((stats.usedLeaveDays / stats.totalLeaveDays) * 100).toFixed(1)}% used
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-200 rounded-full flex items-center justify-center ml-3">
                      <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-green-600 mb-1 uppercase tracking-wide">Days Remaining</p>
                      <p className="text-2xl lg:text-3xl font-bold text-green-800">{stats.remainingLeaveDays}</p>
                      <div className="flex items-center mt-1">
                        <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">
                          {((stats.remainingLeaveDays / stats.totalLeaveDays) * 100).toFixed(1)}% left
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-200 rounded-full flex items-center justify-center ml-3">
                      <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-purple-600 mb-1 uppercase tracking-wide">Pending Requests</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-800">{stats.pendingRequests}</p>
                      {stats.pendingRequests > 0 && (
                        <Badge className="mt-1 bg-purple-200 text-purple-800 text-xs">
                          Under Review
                        </Badge>
                      )}
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-200 rounded-full flex items-center justify-center ml-3">
                      <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leave Types Breakdown */}
          {stats && (
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Leave Types Used This Year
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {Object.entries(stats.leaveTypesUsed).map(([type, days]) => (
                    <div key={type} className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.toLowerCase().replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 font-semibold">
                        {days} day{days !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
                {stats.approvedThisYear > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 text-center">
                      <span className="font-semibold">{stats.approvedThisYear}</span> leave request{stats.approvedThisYear !== 1 ? 's' : ''} approved this year
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Form */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl lg:text-2xl flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Leave Application Form
              </CardTitle>
              <p className="text-white/90 text-sm lg:text-base">Fill out the form below to submit your leave request</p>
            </CardHeader>
            <CardContent className="p-6 lg:p-8">
              <LeaveApplicationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 