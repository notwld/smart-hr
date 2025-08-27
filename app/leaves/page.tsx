"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LeaveApplicationForm from "@/components/leaves/LeaveApplicationForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Filter, Search, Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  managerStatus: string;
  adminStatus: string;
  managerComment?: string;
  adminComment?: string;
  managerId?: string;
  adminId?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  manager?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  admin?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const router = useRouter();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves");
      if (!response.ok) throw new Error("Failed to fetch leaves");
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      toast.error("Error loading leave requests");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "PENDING").length,
    approved: leaves.filter(l => l.status === "APPROVED").length,
    rejected: leaves.filter(l => l.status === "REJECTED").length,
  };

  const handleApprove = async (id: string, status: string, comment: string) => {
    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update leave request");
      }

      const updatedLeave = await response.json();

      if (status === "APPROVED") {
        if (updatedLeave.managerStatus === "APPROVED" && updatedLeave.adminStatus !== "APPROVED") {
          toast.success("Leave request approved by team leader. Waiting for admin approval.");
        } else if (updatedLeave.managerStatus === "APPROVED" && updatedLeave.adminStatus === "APPROVED") {
          toast.success("Leave request fully approved!");
        }
      } else if (status === "REJECTED") {
        toast.success("Leave request rejected");
      }

      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message || "Error updating leave request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-accent text-accent-foreground";
      case "REJECTED":
        return "bg-destructive text-destructive-foreground";
      case "PENDING":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.user.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || leave.status === statusFilter;
    const matchesType = typeFilter === "ALL" || leave.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader size="lg" text="Loading leave management..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="w-full container py-8 px-4">
        {/* Header */}
        <div className="w-full text-center mb-8">
          <Card className="w-full border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
            <CardHeader className="w-full text-white">
              <div className="flex justify-between items-center" >
              <div>
                <CardTitle className="text-3xl w-full font-bold flex gap-2">
                  <Calendar className="w-8 h-8" />
                  Leave Management
                </CardTitle>
                <p className="text-left text-white/90 mt-1">Manage and track leave requests</p>
              </div>
              <div className="flex">
                <Button
                  onClick={() => router.push('/leaves/apply')}
                  className="text-black bg-white px-8 py-3 text-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Apply for Leave
                </Button>
              </div>
              </div>
             
            </CardHeader>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1 uppercase tracking-wide">Total Requests</p>
                  <p className="text-2xl lg:text-3xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-200 rounded-full flex items-center justify-center ml-3">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-yellow-600 mb-1 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl lg:text-3xl font-bold text-yellow-800">{stats.pending}</p>
                  {stats.pending > 0 && (
                    <Badge className="mt-1 bg-yellow-200 text-yellow-800 text-xs">
                      Needs Review
                    </Badge>
                  )}
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-200 rounded-full flex items-center justify-center ml-3">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-green-600 mb-1 uppercase tracking-wide">Approved</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-800">{stats.approved}</p>
                  {stats.total > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {((stats.approved / stats.total) * 100).toFixed(1)}% approval rate
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-200 rounded-full flex items-center justify-center ml-3">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-red-600 mb-1 uppercase tracking-wide">Rejected</p>
                  <p className="text-2xl lg:text-3xl font-bold text-red-800">{stats.rejected}</p>
                  {stats.total > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {((stats.rejected / stats.total) * 100).toFixed(1)}% rejection rate
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-200 rounded-full flex items-center justify-center ml-3">
                  <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}


        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or department..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="VACATION">Vacation</SelectItem>
                    <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                    <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                    <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredLeaves.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No leave requests found</h3>
                  <p className="text-gray-500">Try adjusting your filters or be the first to apply for leave!</p>
                </CardContent>
              </Card>
            ) : (
              filteredLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  onApprove={handleApprove}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredLeaves.filter((leave) => leave.status === "PENDING").length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No pending requests</h3>
                  <p className="text-gray-500">All leave requests have been reviewed!</p>
                </CardContent>
              </Card>
            ) : (
              filteredLeaves
                .filter((leave) => leave.status === "PENDING")
                .map((leave) => (
                  <LeaveCard
                    key={leave.id}
                    leave={leave}
                    onApprove={handleApprove}
                    getStatusColor={getStatusColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filteredLeaves.filter((leave) => leave.status === "APPROVED").length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No approved requests</h3>
                  <p className="text-gray-500">Approved leave requests will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              filteredLeaves
                .filter((leave) => leave.status === "APPROVED")
                .map((leave) => (
                  <LeaveCard
                    key={leave.id}
                    leave={leave}
                    onApprove={handleApprove}
                    getStatusColor={getStatusColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filteredLeaves.filter((leave) => leave.status === "REJECTED").length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No rejected requests</h3>
                  <p className="text-gray-500">Rejected leave requests will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              filteredLeaves
                .filter((leave) => leave.status === "REJECTED")
                .map((leave) => (
                  <LeaveCard
                    key={leave.id}
                    leave={leave}
                    onApprove={handleApprove}
                    getStatusColor={getStatusColor}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Enhanced LeaveCard component with modern design
function LeaveCard({ leave, onApprove, getStatusColor }: {
  leave: Leave;
  onApprove: (id: string, status: string, comment: string) => void;
  getStatusColor: (status: string) => string;
}) {
  const [comment, setComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);

  // Get session to determine if the current user is team leader or admin
  const [currentUserLegacyRole, setCurrentUserLegacyRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTeamLeader, setIsTeamLeader] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const userData = await response.json();
          // Use legacyRole if available, fallback to role for compatibility
          setCurrentUserLegacyRole(userData.legacyRole || userData.role);
          setCurrentUserId(userData.id);

          // Check if user is a team leader by fetching teams they lead
          const teamsResponse = await fetch("/api/teams/leading");
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setIsTeamLeader(teamsData.length > 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleApproveClick = (status: "APPROVED" | "REJECTED") => {
    setActionType(status);
    setShowCommentInput(true);
  };

  const handleSubmitAction = () => {
    if (actionType) {
      onApprove(leave.id, actionType, comment);
      setShowCommentInput(false);
      setComment("");
      setActionType(null);
    }
  };

  const canApproveAsTeamLeader =
    (currentUserLegacyRole === "ADMIN" || isTeamLeader) &&
    leave.managerId === currentUserId &&
    leave.managerStatus === "PENDING";

  const canApproveAsAdmin =
    currentUserLegacyRole === "ADMIN" &&
    leave.adminId === currentUserId &&
    leave.managerStatus === "APPROVED" &&
    leave.adminStatus === "PENDING";

  // Calculate leave duration
  const calculateDays = () => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
      <CardContent className="p-5 lg:p-6">
        {/* Header with user info and status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm lg:text-lg">
              {leave.user.firstName.charAt(0)}{leave.user.lastName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
                {leave.user.firstName} {leave.user.lastName}
              </h3>
              <p className="text-sm text-gray-500 truncate">{leave.user.department}</p>
              <p className="text-xs text-gray-400 mt-1">
                Applied {new Date(leave.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <Badge className={`${getStatusColor(leave.status)} flex items-center gap-1 px-3 py-1`}>
              {getStatusIcon(leave.status)}
              <span className="text-xs font-medium">{leave.status}</span>
            </Badge>
          </div>
        </div>

        {/* Leave details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 lg:p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs lg:text-sm font-medium text-blue-700">Leave Type</span>
            </div>
            <p className="text-blue-900 font-semibold text-sm lg:text-base mb-2">{leave.type}</p>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {calculateDays()} day{calculateDays() > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 lg:p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs lg:text-sm font-medium text-green-700">Duration</span>
            </div>
            <div className="space-y-1">
              <p className="text-green-900 font-semibold text-xs lg:text-sm">
                {new Date(leave.startDate).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-green-400"></div>
                <span className="text-green-600 text-xs">to</span>
                <div className="w-2 h-0.5 bg-green-400"></div>
              </div>
              <p className="text-green-900 font-semibold text-xs lg:text-sm">
                {new Date(leave.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 lg:p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs lg:text-sm font-medium text-purple-700">Reason</span>
            </div>
            <p className="text-purple-900 text-xs lg:text-sm leading-relaxed line-clamp-3">{leave.reason}</p>
          </div>
        </div>

        {/* Approval status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-yellow-700" />
                </div>
                <span className="text-sm font-medium text-yellow-800">Team Leader Review</span>
              </div>
              <Badge className={`${getStatusColor(leave.managerStatus)} flex items-center gap-1 text-xs`}>
                {getStatusIcon(leave.managerStatus)}
                {leave.managerStatus}
              </Badge>
            </div>
            {leave.manager && (
              <p className="text-xs text-yellow-700 font-medium mb-1">
                {leave.manager.firstName} {leave.manager.lastName}
              </p>
            )}
            {leave.managerComment && (
              <p className="text-xs text-yellow-600 italic bg-white p-2 rounded border">"{leave.managerComment}"</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-700" />
                </div>
                <span className="text-sm font-medium text-blue-800">Admin Review</span>
              </div>
              <Badge className={`${getStatusColor(leave.adminStatus)} flex items-center gap-1 text-xs`}>
                {getStatusIcon(leave.adminStatus)}
                {leave.adminStatus}
              </Badge>
            </div>
            {leave.admin && (
              <p className="text-xs text-blue-700 font-medium mb-1">
                {leave.admin.firstName} {leave.admin.lastName}
              </p>
            )}
            {leave.adminComment && (
              <p className="text-xs text-blue-600 italic bg-white p-2 rounded border">"{leave.adminComment}"</p>
            )}
          </div>
        </div>

        {/* Approval workflow */}
        {showCommentInput ? (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  {actionType === "APPROVED" ? "Approval Comment (Optional)" : "Rejection Reason"}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={actionType === "APPROVED" ? "Add approval notes..." : "Explain rejection reason..."}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitAction}
                  className={actionType === "APPROVED" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                >
                  {actionType === "APPROVED" ? "Approve" : "Reject"} Request
                </Button>
                <Button
                  onClick={() => {
                    setShowCommentInput(false);
                    setComment("");
                    setActionType(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {canApproveAsTeamLeader && (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex-1"
                  onClick={() => handleApproveClick("APPROVED")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve as Team Leader
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex-1"
                  onClick={() => handleApproveClick("REJECTED")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject as Team Leader
                </Button>
              </div>
            )}

            {canApproveAsAdmin && (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex-1"
                  onClick={() => handleApproveClick("APPROVED")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve as Admin
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex-1"
                  onClick={() => handleApproveClick("REJECTED")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject as Admin
                </Button>
              </div>
            )}

            {/* Show approval flow message */}
            {leave.status === "PENDING" && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-3 text-gray-700">Approval Progress:</p>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${leave.managerStatus === "APPROVED" ? "text-green-600" : leave.managerStatus === "REJECTED" ? "text-red-600" : "text-yellow-600"}`}>
                    {getStatusIcon(leave.managerStatus)}
                    <span className="text-sm">Team Leader</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className={`flex items-center space-x-2 ${leave.adminStatus === "APPROVED" ? "text-green-600" : leave.adminStatus === "REJECTED" ? "text-red-600" : leave.adminStatus === "PENDING" && leave.managerStatus === "APPROVED" ? "text-yellow-600" : "text-gray-400"}`}>
                    {getStatusIcon(leave.adminStatus)}
                    <span className="text-sm">Admin</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 