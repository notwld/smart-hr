"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calendar, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { safeFormatDate } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  leaveType: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
}

export default function LeavesTab() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchLeaves = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter === "all" ? "" : statusFilter,
      });

      const response = await fetch(`/api/leaves?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leaves");

      const data = await response.json();
      setLeaves(data.leaves || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (leaveId: string, status: string) => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update leave status");

      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave:", error);
      toast.error("Failed to update leave status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    return safeFormatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (startDate == null || endDate == null) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size="lg" text="Loading leave requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600">
        <CardHeader className="text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Leave Management
          </CardTitle>
          <p className="text-white/90 mt-1">Review and manage employee leave requests</p>
        </CardHeader>
      </Card>

      {/* Search and Filter Card */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Filter className="w-5 h-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Requests</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-purple-200 focus:border-purple-500 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => fetchLeaves()}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <FileText className="w-5 h-5 mr-2" />
            Leave Requests
            <Badge className="ml-3 bg-purple-50 text-purple-700 border-purple-200">
              {leaves.length} requests
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-700">Leave Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                  <TableHead className="font-semibold text-gray-700">Dates</TableHead>
                  <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No leave requests found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave, index) => (
                    <TableRow key={leave.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(leave.user?.firstName ?? "").charAt(0)}{(leave.user?.lastName ?? "").charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{leave.user?.firstName ?? ""} {leave.user?.lastName ?? ""}</p>
                            <p className="text-xs text-gray-500">{leave.user?.position ?? ""} - {leave.user?.department ?? ""}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {leave.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="font-semibold">{calculateDays(leave.startDate, leave.endDate)} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          <div className="font-medium">{formatDate(leave.startDate)}</div>
                          <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={leave.reason ?? ""}>
                          {leave.reason ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`font-medium ${getStatusColor(leave.status)}`}>
                          {leave.status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {leave.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateLeaveStatus(leave.id, "APPROVED")}
                              className="bg-green-500 hover:bg-green-600 text-white h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateLeaveStatus(leave.id, "REJECTED")}
                              className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {leave.status !== "PENDING" && (
                          <span className="text-sm text-gray-400">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 p-4 bg-[#f3e8ff] rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page <span className="font-semibold text-purple-600">{currentPage}</span> of{" "}
                  <span className="font-semibold text-purple-600">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm bg-white rounded border border-purple-200">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
