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
import { Calendar, Filter, Search } from "lucide-react";

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage and track leave requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Apply for Leave"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveApplicationForm />
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onApprove={handleApprove}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredLeaves
            .filter((leave) => leave.status === "PENDING")
            .map((leave) => (
              <LeaveCard
                key={leave.id}
                leave={leave}
                onApprove={handleApprove}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredLeaves
            .filter((leave) => leave.status === "APPROVED")
            .map((leave) => (
              <LeaveCard
                key={leave.id}
                leave={leave}
                onApprove={handleApprove}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredLeaves
            .filter((leave) => leave.status === "REJECTED")
            .map((leave) => (
              <LeaveCard
                key={leave.id}
                leave={leave}
                onApprove={handleApprove}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Completely separate LeaveCard component
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {leave.user.firstName} {leave.user.lastName}
            </h3>
            <p className="text-sm text-gray-500">{leave.user.department}</p>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusColor(leave.status)}>
              {leave.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Leave Type</p>
            <p>{leave.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p>
              {new Date(leave.startDate).toLocaleDateString()} -{" "}
              {new Date(leave.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Reason</p>
            <p>{leave.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Team Leader Status</p>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(leave.managerStatus)}>
                {leave.managerStatus}
              </Badge>
              {leave.managerComment && (
                <p className="text-sm text-gray-500">
                  ({leave.managerComment})
                </p>
              )}
            </div>
            {leave.manager && (
              <p className="text-xs text-gray-500 mt-1">
                Team Leader: {leave.manager.firstName} {leave.manager.lastName}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Admin Status</p>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(leave.adminStatus)}>
                {leave.adminStatus}
              </Badge>
              {leave.adminComment && (
                <p className="text-sm text-gray-500">
                  ({leave.adminComment})
                </p>
              )}
            </div>
            {leave.admin && (
              <p className="text-xs text-gray-500 mt-1">
                Admin: {leave.admin.firstName} {leave.admin.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Approval workflow */}
        {showCommentInput ? (
          <div className="mt-4">
            <div className="mb-3">
              <p className="text-sm mb-2">Add a comment (optional):</p>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitAction}
                variant="default"
              >
                Submit
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
          </div>
        ) : (
          <>
            {canApproveAsTeamLeader && (
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 hover:bg-green-100"
                  onClick={() => handleApproveClick("APPROVED")}
                >
                  Approve as Team Leader
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => handleApproveClick("REJECTED")}
                >
                  Reject as Team Leader
                </Button>
              </div>
            )}
            
            {canApproveAsAdmin && (
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 hover:bg-green-100"
                  onClick={() => handleApproveClick("APPROVED")}
                >
                  Approve as Admin
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => handleApproveClick("REJECTED")}
                >
                  Reject as Admin
                </Button>
              </div>
            )}
            
            {/* Show approval flow message */}
            {leave.status === "PENDING" && (
              <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                <p className="font-medium mb-1">Approval Flow:</p>
                <ol className="list-decimal pl-5">
                  <li className={leave.managerStatus === "APPROVED" ? "text-green-600" : leave.managerStatus === "REJECTED" ? "text-red-600" : ""}>
                    Team Leader Approval {leave.managerStatus === "APPROVED" ? "✓" : leave.managerStatus === "REJECTED" ? "✗" : "(Pending)"}
                  </li>
                  <li className={leave.adminStatus === "APPROVED" ? "text-green-600" : leave.adminStatus === "REJECTED" ? "text-red-600" : ""}>
                    Admin Approval {leave.adminStatus === "APPROVED" ? "✓" : leave.adminStatus === "REJECTED" ? "✗" : "(Pending)"}
                  </li>
                </ol>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 