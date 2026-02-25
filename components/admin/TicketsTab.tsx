"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  UserX
} from "lucide-react";
import { Loader, ButtonLoader } from "@/components/ui/loader";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function safeFormatDistanceToNow(value: string | Date | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

interface TicketData {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdById: string;
  assignedToId?: string;
  resolvedById?: string;
  resolvedAt?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    pfp?: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    pfp?: string;
  };
  resolvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }>;
  activities?: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
    metadata?: any;
  }>;
  _count: {
    comments: number;
    attachments: number;
  };
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
}

// Employee Tickets Page Component
export function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignedTotalPages, setAssignedTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedSearchTerm, setAssignedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedStatusFilter, setAssignedStatusFilter] = useState("all");
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  // Comment form
  const [commentForm, setCommentForm] = useState({
    content: "",
    isInternal: false
  });

  // Create ticket form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
    dueDate: "",
    tags: [] as string[]
  });

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tickets created by current user
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        status: statusFilter,
        createdBy: "current",
      });

      const response = await fetch(`/api/tickets?${params}`);

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch my tickets:", response.status, errorText);
        toast.error("Failed to load my tickets");
      }
    } catch (error) {
      console.error("Error fetching my tickets:", error);
      toast.error("Failed to load my tickets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  const fetchAssignedTickets = useCallback(async () => {
    setAssignedLoading(true);
    try {
      // Fetch tickets assigned to current user
      const params = new URLSearchParams({
        page: assignedCurrentPage.toString(),
        limit: "20",
        search: assignedSearchTerm,
        status: assignedStatusFilter,
        assignedTo: "current",
      });

      const response = await fetch(`/api/tickets?${params}`);

      if (response.ok) {
        const data = await response.json();
        setAssignedTickets(data.tickets || []);
        setAssignedTotalPages(data.pagination?.totalPages || 1);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch assigned tickets:", response.status, errorText);
        toast.error("Failed to load assigned tickets");
      }
    } catch (error) {
      console.error("Error fetching assigned tickets:", error);
      toast.error("Failed to load assigned tickets");
    } finally {
      setAssignedLoading(false);
    }
  }, [assignedCurrentPage, assignedSearchTerm, assignedStatusFilter]);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  const handleCreateTicket = async () => {
    if (!createForm.title || !createForm.description) {
      toast.error("Title and description are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Ticket created successfully");
        setShowCreateDialog(false);
        setCreateForm({
          title: "",
          description: "",
          category: "OTHER",
          priority: "MEDIUM",
          dueDate: "",
          tags: []
        });
        fetchMyTickets(); // Refresh my tickets
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Error creating ticket");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentForm.content || !selectedTicket) return;

    setAddingComment(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentForm),
      });

      if (response.ok) {
        toast.success("Comment added successfully");
        setCommentForm({ content: "", isInternal: false });
        // Refresh ticket lists
        await Promise.all([fetchMyTickets(), fetchAssignedTickets()]);
        // Fetch the updated ticket and keep the dialog open
        try {
          const updatedRes = await fetch(`/api/tickets/${selectedTicket.id}`);
          if (updatedRes.ok) {
            const updatedTicket = await updatedRes.json();
            setSelectedTicket(updatedTicket);
          }
        } catch {}
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    };
    return styles[priority as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      TECHNICAL: AlertCircle,
      HR: User,
      LEAVE: Clock,
      PAYROLL: Ticket,
      EQUIPMENT: AlertTriangle,
      ACCESS: User,
      TRAINING: BookOpen,
      OTHER: MessageSquare
    };
    const Icon = icons[category as keyof typeof icons] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Ticket className="w-6 h-6 mr-2" />
                Support Tickets
              </CardTitle>
              <p className="text-white/90 mt-1">View and manage all your tickets</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 text-white hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={createForm.category} onValueChange={(value) => setCreateForm({...createForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TECHNICAL">Technical</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="LEAVE">Leave</SelectItem>
                          <SelectItem value="PAYROLL">Payroll</SelectItem>
                          <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                          <SelectItem value="ACCESS">Access</SelectItem>
                          <SelectItem value="TRAINING">Training</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={createForm.priority} onValueChange={(value) => setCreateForm({...createForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateForm({...createForm, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={isCreating}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {isCreating ? <ButtonLoader size="sm" /> : 'Create Ticket'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="my-tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="assigned-tickets">Assigned Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          {/* My Tickets Filters */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <Filter className="w-5 h-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search my tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_FOR_CUSTOMER">Waiting</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Tickets Table */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <Ticket className="w-5 h-5 mr-2" />
                My Tickets
                {tickets.length > 0 && (
                  <Badge className="ml-3 bg-purple-50 text-purple-700 border-purple-200">
                    {tickets.length} tickets
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader size="lg" text="Loading my tickets..." />
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Ticket className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No tickets found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or create a new ticket</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                          <TableHead className="font-semibold text-gray-700">Ticket</TableHead>
                          <TableHead className="font-semibold text-gray-700">Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Assigned To</TableHead>
                          <TableHead className="font-semibold text-gray-700">Created</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-gray-50">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                {getCategoryIcon(ticket.category)}
                                <div>
                                  <div className="font-medium text-gray-900">{ticket.ticketNumber}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.title}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MessageSquare className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{ticket._count?.comments ?? 0}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {ticket.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={getPriorityBadge(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={getStatusBadge(ticket.status)}>
                                {(ticket.status ?? "").replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              {ticket.assignedTo ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                    {(ticket.assignedTo?.firstName ?? "").charAt(0)}{(ticket.assignedTo?.lastName ?? "").charAt(0) || "?"}
                                  </div>
                                  <span className="text-sm text-gray-700">
                                    {ticket.assignedTo?.firstName ?? ""} {ticket.assignedTo?.lastName ?? ""}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm text-gray-700">
                                {safeFormatDistanceToNow(ticket.createdAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                by {ticket.createdBy?.firstName ?? ""} {ticket.createdBy?.lastName ?? ""}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/tickets/${ticket.id}`);
                                    if (response.ok) {
                                      const fullTicketData = await response.json();
                                      setSelectedTicket(fullTicketData);
                                      setShowViewDialog(true);
                                    } else {
                                      toast.error("Failed to load ticket details");
                                    }
                                  } catch (error) {
                                    console.error("Error fetching ticket details:", error);
                                    toast.error("Error loading ticket details");
                                  }
                                }}
                                className="h-8 w-auto px-3 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                          {currentPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned-tickets" className="space-y-4">
          {/* Assigned Tickets Filters */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <Filter className="w-5 h-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search assigned tickets..."
                      value={assignedSearchTerm}
                      onChange={(e) => setAssignedSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={assignedStatusFilter} onValueChange={setAssignedStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_FOR_CUSTOMER">Waiting</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tickets Table */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2" />
                Assigned Tickets
                {assignedTickets.length > 0 && (
                  <Badge className="ml-3 bg-orange-50 text-orange-700 border-orange-200">
                    {assignedTickets.length} tickets
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader size="lg" text="Loading assigned tickets..." />
                </div>
              ) : assignedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <User className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No tickets assigned to you</p>
                  <p className="text-gray-400 text-sm">You will see tickets here when they are assigned to you</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                          <TableHead className="font-semibold text-gray-700">Ticket</TableHead>
                          <TableHead className="font-semibold text-gray-700">Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Created By</TableHead>
                          <TableHead className="font-semibold text-gray-700">Created</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-gray-50">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                {getCategoryIcon(ticket.category)}
                                <div>
                                  <div className="font-medium text-gray-900">{ticket.ticketNumber}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.title}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MessageSquare className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{ticket._count?.comments ?? 0}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {ticket.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={getPriorityBadge(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={getStatusBadge(ticket.status)}>
                                {(ticket.status ?? "").replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                  {(ticket.createdBy?.firstName ?? "").charAt(0)}{(ticket.createdBy?.lastName ?? "").charAt(0) || "?"}
                                </div>
                                <span className="text-sm text-gray-700">
                                  {ticket.createdBy?.firstName ?? ""} {ticket.createdBy?.lastName ?? ""}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm text-gray-700">
                                {safeFormatDistanceToNow(ticket.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/tickets/${ticket.id}`);
                                    if (response.ok) {
                                      const fullTicketData = await response.json();
                                      setSelectedTicket(fullTicketData);
                                      setShowViewDialog(true);
                                    } else {
                                      toast.error("Failed to load ticket details");
                                    }
                                  } catch (error) {
                                    console.error("Error fetching ticket details:", error);
                                    toast.error("Error loading ticket details");
                                  }
                                }}
                                className="h-8 w-auto px-3 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {assignedTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {assignedCurrentPage} of {assignedTotalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignedCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={assignedCurrentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                          {assignedCurrentPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignedCurrentPage(prev => Math.min(assignedTotalPages, prev + 1))}
                          disabled={assignedCurrentPage === assignedTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Ticket Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              {selectedTicket?.ticketNumber} - {selectedTicket?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments ({(selectedTicket.comments ?? []).length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(selectedTicket.status)}>
                          {(selectedTicket.status ?? "").replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <div className="mt-1">
                        <Badge className={getPriorityBadge(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <div className="mt-1 text-sm text-gray-600">
                        {safeFormatDistanceToNow(selectedTicket.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {selectedTicket.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Created By</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(selectedTicket.createdBy?.firstName ?? "").charAt(0)}{(selectedTicket.createdBy?.lastName ?? "").charAt(0) || "?"}
                        </div>
                        <span className="text-sm">
                          {selectedTicket.createdBy?.firstName ?? ""} {selectedTicket.createdBy?.lastName ?? ""}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Assigned To</Label>
                      <div className="mt-1">
                        {selectedTicket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                              {(selectedTicket.assignedTo?.firstName ?? "").charAt(0)}{(selectedTicket.assignedTo?.lastName ?? "").charAt(0) || "?"}
                            </div>
                            <span className="text-sm">
                              {selectedTicket.assignedTo?.firstName ?? ""} {selectedTicket.assignedTo?.lastName ?? ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  {(selectedTicket.comments ?? []).map((comment) => (
                    <Card key={comment.id} className="border-0 shadow-sm bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(comment.author?.firstName ?? "").charAt(0)}{(comment.author?.lastName ?? "").charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.author?.firstName ?? ""} {comment.author?.lastName ?? ""}
                              </span>
                              <span className="text-xs text-gray-500">
                                {safeFormatDistanceToNow(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentForm.content}
                          onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={commentForm.isInternal}
                              onChange={(e) => setCommentForm({...commentForm, isInternal: e.target.checked})}
                            />
                            Internal comment
                          </label>
                          <Button
                            onClick={handleAddComment}
                            disabled={addingComment || !commentForm.content.trim()}
                            size="sm"
                          >
                            {addingComment ? <ButtonLoader size="sm" /> : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Add Comment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    {selectedTicket.activities && selectedTicket.activities.length > 0 ? (
                      selectedTicket.activities.map((activity: any) => (
                        <Card key={activity.id} className="border-0 shadow-sm bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                {(activity.user?.firstName ?? "").charAt(0)}{(activity.user?.lastName ?? "").charAt(0) || "?"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {activity.user?.firstName ?? ""} {activity.user?.lastName ?? ""}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {safeFormatDistanceToNow(activity.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                                {activity.metadata && (
                                  <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                    <pre>{JSON.stringify(activity.metadata, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No activity log available
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TicketsTab() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [assignees, setAssignees] = useState<Array<{id: string, firstName: string, lastName: string, department: string}>>([]);

  // Create ticket form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
    assignedToId: "",
    dueDate: "",
    tags: [] as string[]
  });

  // Add comment form
  const [commentForm, setCommentForm] = useState({
    content: "",
    isInternal: false
  });
  const [addingComment, setAddingComment] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        assignedTo: assignedFilter,
      });

      const response = await fetch(`/api/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets ?? []);
        setTotalPages(data.pagination.totalPages);
        setAssignees(data.filters.assignees);

        // Calculate stats
        const ticketStats = {
          total: data.pagination.total,
          open: (data.tickets ?? []).filter((t: TicketData) => t.status === "OPEN").length,
          inProgress: (data.tickets ?? []).filter((t: TicketData) => t.status === "IN_PROGRESS").length,
          resolved: (data.tickets ?? []).filter((t: TicketData) => t.status === "RESOLVED").length,
          closed: (data.tickets ?? []).filter((t: TicketData) => t.status === "CLOSED").length,
          overdue: (data.tickets ?? []).filter((t: TicketData) =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "RESOLVED" && t.status !== "CLOSED"
          ).length
        };
        setStats(ticketStats);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter, categoryFilter, assignedFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!createForm.title || !createForm.description) {
      toast.error("Title and description are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Ticket created successfully");
        setShowCreateDialog(false);
        setCreateForm({
          title: "",
          description: "",
          category: "OTHER",
          priority: "MEDIUM",
          assignedToId: "",
          dueDate: "",
          tags: []
        });
        fetchTickets();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Error creating ticket");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentForm.content || !selectedTicket) return;

    setAddingComment(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentForm),
      });

      if (response.ok) {
        toast.success("Comment added successfully");
        setCommentForm({ content: "", isInternal: false });
        // Refresh ticket data in lists
        await fetchTickets();
        // Also refresh the currently viewed ticket so the new comment appears immediately
        if (selectedTicket) {
          try {
            const updatedRes = await fetch(`/api/tickets/${selectedTicket.id}`);
            if (updatedRes.ok) {
              const updatedTicket = await updatedRes.json();
              setSelectedTicket(updatedTicket);
            }
          } catch {}
        }

      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Ticket status updated");
        // Refresh tables
        fetchTickets();
        // If we're viewing this ticket, refresh its data so dropdown remains
        if (selectedTicket && selectedTicket.id === ticketId) {
          const updatedRes = await fetch(`/api/tickets/${ticketId}`);
          if (updatedRes.ok) {
            const updatedTicket = await updatedRes.json();
            setSelectedTicket(updatedTicket);
          }
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Error updating ticket");
    }
  };

  const handleAssignTicket = async (ticketId: string, assignedToId: string | null) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedToId }),
      });

      if (response.ok) {
        toast.success(assignedToId ? "Ticket assigned successfully" : "Ticket unassigned successfully");
        fetchTickets();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to assign ticket");
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast.error("Error assigning ticket");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    };
    return styles[priority as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      TECHNICAL: AlertCircle,
      HR: User,
      LEAVE: Clock,
      PAYROLL: Ticket,
      EQUIPMENT: AlertTriangle,
      ACCESS: User,
      TRAINING: BookOpen,
      OTHER: MessageSquare
    };
    const Icon = icons[category as keyof typeof icons] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Ticket className="w-6 h-6 mr-2" />
                Ticket Management System
              </CardTitle>
              <p className="text-white/90 mt-1">Manage support tickets and customer issues</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 text-white hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={createForm.category} onValueChange={(value) => setCreateForm({...createForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TECHNICAL">Technical</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="LEAVE">Leave</SelectItem>
                          <SelectItem value="PAYROLL">Payroll</SelectItem>
                          <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                          <SelectItem value="ACCESS">Access</SelectItem>
                          <SelectItem value="TRAINING">Training</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={createForm.priority} onValueChange={(value) => setCreateForm({...createForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateForm({...createForm, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={isCreating}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {isCreating ? <ButtonLoader size="sm" /> : 'Create Ticket'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total Tickets</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            <div className="text-sm text-green-700">Open</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-yellow-700">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.resolved}</div>
            <div className="text-sm text-purple-700">Resolved</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            <div className="text-sm text-gray-700">Closed</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-red-700">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_FOR_CUSTOMER">Waiting</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="LEAVE">Leave</SelectItem>
                  <SelectItem value="PAYROLL">Payroll</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                  <SelectItem value="ACCESS">Access</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                          {(assignee?.firstName ?? "").charAt(0)}{(assignee?.lastName ?? "").charAt(0) || "?"}
                        </div>
                        <span>{assignee?.firstName ?? ""} {assignee?.lastName ?? ""}</span>
                        <span className="text-xs text-gray-500">({assignee?.department ?? ""})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Ticket className="w-5 h-5 mr-2" />
            Tickets
            {tickets.length > 0 && (
              <Badge className="ml-3 bg-purple-50 text-purple-700 border-purple-200">
                {tickets.length} tickets
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader size="lg" text="Loading tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Ticket className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No tickets found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or create a new ticket</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                      <TableHead className="font-semibold text-gray-700">Ticket</TableHead>
                      <TableHead className="font-semibold text-gray-700">Category</TableHead>
                      <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Assigned To</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(ticket.category)}
                            <div>
                              <div className="font-medium text-gray-900">{ticket.ticketNumber}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <MessageSquare className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{ticket._count?.comments ?? 0}</span>
                                {(ticket._count?.attachments ?? 0) > 0 && (
                                  <>
                                    <Paperclip className="w-3 h-3 text-gray-400 ml-2" />
                                    <span className="text-xs text-gray-500">{ticket._count?.attachments ?? 0}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={getStatusBadge(ticket.status)}>
                            {(ticket.status ?? "").replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                {(ticket.assignedTo?.firstName ?? "").charAt(0)}{(ticket.assignedTo?.lastName ?? "").charAt(0) || "?"}
                              </div>
                              <span className="text-sm text-gray-700">
                                {ticket.assignedTo?.firstName ?? ""} {ticket.assignedTo?.lastName ?? ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700">
                            {safeFormatDistanceToNow(ticket.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            by {ticket.createdBy?.firstName ?? ""} {ticket.createdBy?.lastName ?? ""}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/tickets/${ticket.id}`);
                                  if (response.ok) {
                                    const fullTicketData = await response.json();
                                    setSelectedTicket(fullTicketData);
                                    setShowViewDialog(true);
                                  } else {
                                    toast.error("Failed to load ticket details");
                                  }
                                } catch (error) {
                                  console.error("Error fetching ticket details:", error);
                                  toast.error("Error loading ticket details");
                                }
                              }}
                              className="h-8 w-8 p-0"
                              title="View ticket details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Assignment Dropdown */}
                            <Select
                              value={ticket.assignedToId || "unassigned"}
                              onValueChange={(value) => handleAssignTicket(ticket.id, value === "unassigned" ? null : value)}
                            >
                              <SelectTrigger className="h-8 w-auto min-w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  <div className="flex items-center gap-2">
                                    <UserX className="w-4 h-4" />
                                    Unassigned
                                  </div>
                                </SelectItem>
                                {assignees.map((assignee) => (
                                  <SelectItem key={assignee.id} value={assignee.id}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                        {(assignee?.firstName ?? "").charAt(0)}{(assignee?.lastName ?? "").charAt(0) || "?"}
                                      </div>
                                      <span>{assignee?.firstName ?? ""} {assignee?.lastName ?? ""}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Status Dropdown - always visible for admin */}
                            <Select
                              value={ticket.status}
                              onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                            >
                              <SelectTrigger className="h-8 w-auto min-w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="WAITING_FOR_CUSTOMER">Waiting</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                      {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              {selectedTicket?.ticketNumber} - {selectedTicket?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments ({(selectedTicket.comments ?? []).length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(selectedTicket.status)}>
                          {(selectedTicket.status ?? "").replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <div className="mt-1">
                        <Badge className={getPriorityBadge(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <div className="mt-1 text-sm text-gray-600">
                        {safeFormatDistanceToNow(selectedTicket.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select
                      value={selectedTicket.assignedToId || "unassigned"}
                      onValueChange={(value) => handleAssignTicket(selectedTicket.id, value === "unassigned" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <div className="flex items-center gap-2">
                            <UserX className="w-4 h-4" />
                            Unassigned
                          </div>
                        </SelectItem>
                        {assignees.map((assignee) => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                {(assignee?.firstName ?? "").charAt(0)}{(assignee?.lastName ?? "").charAt(0) || "?"}
                              </div>
<span>{assignee?.firstName ?? ""} {assignee?.lastName ?? ""}</span>
                                      <span className="text-xs text-gray-500">({assignee?.department ?? ""})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {selectedTicket.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Created By</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(selectedTicket.createdBy?.firstName ?? "").charAt(0)}{(selectedTicket.createdBy?.lastName ?? "").charAt(0) || "?"}
                        </div>
                        <span className="text-sm">
                          {selectedTicket.createdBy?.firstName ?? ""} {selectedTicket.createdBy?.lastName ?? ""}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Assigned To</Label>
                      <div className="mt-1">
                        {selectedTicket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                              {(selectedTicket.assignedTo?.firstName ?? "").charAt(0)}{(selectedTicket.assignedTo?.lastName ?? "").charAt(0) || "?"}
                            </div>
                            <span className="text-sm">
                              {selectedTicket.assignedTo?.firstName ?? ""} {selectedTicket.assignedTo?.lastName ?? ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  {(selectedTicket.comments ?? []).map((comment) => (
                    <Card key={comment.id} className="border-0 shadow-sm bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(comment.author?.firstName ?? "").charAt(0)}{(comment.author?.lastName ?? "").charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.author?.firstName ?? ""} {comment.author?.lastName ?? ""}
                              </span>
                              <span className="text-xs text-gray-500">
                                {safeFormatDistanceToNow(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentForm.content}
                          onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={commentForm.isInternal}
                              onChange={(e) => setCommentForm({...commentForm, isInternal: e.target.checked})}
                            />
                            Internal comment
                          </label>
                          <Button
                            onClick={handleAddComment}
                            disabled={addingComment || !commentForm.content.trim()}
                            size="sm"
                          >
                            {addingComment ? <ButtonLoader size="sm" /> : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Add Comment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    {selectedTicket.activities && selectedTicket.activities.length > 0 ? (
                      selectedTicket.activities.map((activity: any) => (
                        <Card key={activity.id} className="border-0 shadow-sm bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                {(activity.user?.firstName ?? "").charAt(0)}{(activity.user?.lastName ?? "").charAt(0) || "?"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {activity.user?.firstName ?? ""} {activity.user?.lastName ?? ""}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {safeFormatDistanceToNow(activity.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                                {activity.metadata && (
                                  <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                    <pre>{JSON.stringify(activity.metadata, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No activity log available
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
