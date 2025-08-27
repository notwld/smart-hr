"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Edit, Trash2, User, Users, UserPlus, TrendingUp, TrendingDown, DollarSign, Calendar, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadForm } from "@/components/leads/LeadForm";
import { ImportLeadsDialog } from "@/components/leads/ImportLeadsDialog";
import { useToast } from "@/hooks/use-toast";
import PermissionGuard from "@/components/PermissionGuard";

interface Lead {
  id: string;
  date: string;
  time: string;
  platform: string;
  firstCall: string;
  comments?: string;
  service: string;
  name: string;
  email: string;
  number: string;
  address?: string;
  credits: number;
  cost: number;
  status?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    firstName: string;
    lastName: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch leads",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.number.includes(searchTerm) ||
          lead.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "unknown") {
        filtered = filtered.filter((lead) => !lead.status || lead.status === "");
      } else {
        filtered = filtered.filter((lead) => lead.status === statusFilter);
      }
    }

    if (platformFilter !== "all") {
      if (platformFilter === "unknown") {
        filtered = filtered.filter((lead) => !lead.platform || lead.platform === "");
      } else {
        filtered = filtered.filter((lead) => lead.platform === platformFilter);
      }
    }

    if (serviceFilter !== "all") {
      if (serviceFilter === "unknown") {
        filtered = filtered.filter((lead) => !lead.service || lead.service === "");
      } else {
        filtered = filtered.filter((lead) => lead.service === serviceFilter);
      }
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, platformFilter, serviceFilter]);

  const handleCreateLead = async (leadData: any) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead created successfully",
        });
        setIsCreateDialogOpen(false);
        fetchLeads();
      } else {
        toast({
          title: "Error",
          description: "Failed to create lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLead = async (leadData: any) => {
    if (!editingLead) return;

    try {
      const response = await fetch(`/api/leads/${editingLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
        setEditingLead(null);
        fetchLeads();
      } else {
        toast({
          title: "Error",
          description: "Failed to update lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const handleAssignLead = async (leadId: string, employeeId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assigneeId: employeeId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead assigned successfully",
        });
        fetchLeads();
      } else {
        toast({
          title: "Error",
          description: "Failed to assign lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
        fetchLeads();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">No Status</Badge>;
    
    const statusConfig: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", color: string } } = {
      new: { variant: "default", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      contacted: { variant: "secondary", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      qualified: { variant: "default", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
      proposal_sent: { variant: "outline", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
      negotiation: { variant: "outline", color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" },
      converted: { variant: "default", color: "bg-green-100 text-green-800 hover:bg-green-200" },
      lost: { variant: "destructive", color: "bg-red-100 text-red-800 hover:bg-red-200" },
      follow_up: { variant: "secondary", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    };

    const config = statusConfig[status.toLowerCase()] || { variant: "outline", color: "bg-gray-100 text-gray-800" };
    const displayText = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

    return (
      <Badge 
        variant={config.variant} 
        className={`${config.color} border-0 font-medium`}
      >
        {displayText}
      </Badge>
    );
  };

  const getUniqueValues = (key: keyof Lead) => {
    return Array.from(new Set(leads.map(lead => {
      const value = lead[key];
      // Only return string values, filter out objects and other types
      return typeof value === 'string' ? value : null;
    }).filter((value): value is string => value !== null && value !== "")));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div>
              <p className="text-lg font-medium text-gray-800">Loading leads...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your leads</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard 
      permissions="leads.view"
      fallback={
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <Card className="border-0 shadow-lg bg-white p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
          </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">You don't have permission to view leads.</p>
          </Card>
        </div>
      }
    >
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="w-full container mx-auto py-8 px-4 space-y-8">
          {/* Header */}
          <div className="w-full">
            <Card className="w-full border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 mx-auto">
              <CardHeader className="w-full text-white">
                <div className="flex justify-between items-center">
          <div>
                    <CardTitle className="text-3xl w-full font-bold flex gap-2">
                      <Users className="w-8 h-8" />
                      Leads Management
                    </CardTitle>
                    <p className="text-left text-white/90 mt-1">Manage your leads and track conversions</p>
          </div>
                  <div className="flex gap-3">
            <PermissionGuard permissions="leads.import">
              <ImportLeadsDialog onImportComplete={fetchLeads} />
            </PermissionGuard>
            <PermissionGuard permissions="leads.create">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                          <Button className="text-black bg-white px-6 py-2 text-lg hover:bg-gray-100">
                            <Plus className="h-5 w-5 mr-2" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                          <DialogHeader className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg -m-6 mb-6">
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <Plus className="w-5 h-5" />
                              Create New Lead
                            </DialogTitle>
                  </DialogHeader>
                  <LeadForm onSubmit={handleCreateLead} />
                </DialogContent>
              </Dialog>
            </PermissionGuard>
        </div>
                </div>
              </CardHeader>
            </Card>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs lg:text-sm font-medium text-blue-700 uppercase tracking-wide">Total Leads</CardTitle>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-blue-800">{leads.length}</div>
                <p className="text-xs text-blue-600 mt-1">All time leads</p>
          </CardContent>
        </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs lg:text-sm font-medium text-green-700 uppercase tracking-wide">New Leads</CardTitle>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-green-800">
              {leads.filter(lead => lead.status?.toLowerCase() === 'new').length}
            </div>
                <p className="text-xs text-green-600 mt-1">Fresh leads</p>
          </CardContent>
        </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs lg:text-sm font-medium text-purple-700 uppercase tracking-wide">Converted</CardTitle>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-purple-800">
              {leads.filter(lead => lead.status?.toLowerCase() === 'converted').length}
            </div>
                <p className="text-xs text-purple-600 mt-1">Successful conversions</p>
          </CardContent>
        </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs lg:text-sm font-medium text-orange-700 uppercase tracking-wide">Total Value</CardTitle>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-orange-800">
              ${leads.reduce((sum, lead) => sum + lead.cost, 0).toFixed(2)}
            </div>
                <p className="text-xs text-orange-600 mt-1">Revenue potential</p>
          </CardContent>
        </Card>
      </div>

          {/* Search and Filters */}
          <div className="w-full">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Filter className="w-5 h-5" />
                  Search & Filter Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                        placeholder="Search leads by name, email, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
                  <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] h-11 border-2 border-gray-200 focus:border-green-500 transition-colors">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {getUniqueValues('status').map((status) => (
                          <SelectItem key={status} value={status}>
                    {status || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="w-[180px] h-11 border-2 border-gray-200 focus:border-purple-500 transition-colors">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {getUniqueValues('platform').map((platform) => (
                          <SelectItem key={platform} value={platform}>
                    {platform || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger className="w-[180px] h-11 border-2 border-gray-200 focus:border-orange-500 transition-colors">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {getUniqueValues('service').map((service) => (
                          <SelectItem key={service} value={service}>
                    {service || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                  </div>
          </div>
        </CardContent>
      </Card>
          </div>

      {/* Leads Table */}
          <div className="w-full">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                    <Users className="w-6 h-6" />
                    Leads ({filteredLeads.length})
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {filteredLeads.length} of {leads.length} leads
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                      <TableRow className="border-b-2 border-gray-200 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Lead Info</TableHead>
                        <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                        <TableHead className="font-semibold text-gray-700">Service</TableHead>
                        <TableHead className="font-semibold text-gray-700">Platform</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Cost</TableHead>
                        <TableHead className="font-semibold text-gray-700">Assignee</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                        <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{lead.name}</p>
                                <p className="text-xs text-gray-500">{new Date(lead.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{lead.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{lead.number}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {lead.service}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {lead.platform}
                            </Badge>
                          </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                            <span className="font-semibold text-green-600">${lead.cost.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                            {lead.assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  {lead.assignee.firstName[0]}{lead.assignee.lastName[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{lead.assignee.firstName} {lead.assignee.lastName}</p>
                                  <p className="text-xs text-gray-500">Assigned</p>
                                </div>
                              </div>
                            ) : (
                              <Select onValueChange={(employeeId) => handleAssignLead(lead.id, employeeId)}>
                                <SelectTrigger className="w-[140px] h-8 text-xs border-dashed border-red-300 text-red-600 hover:border-red-400">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees?.length>0 && employees?.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                          {employee.firstName[0]}{employee.lastName[0]}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">{employee.firstName} {employee.lastName}</div>
                                          <div className="text-xs text-gray-500">{employee.position}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PermissionGuard permissions="leads.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLead(lead)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permissions="leads.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLeads.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {leads.length === 0 ? "No leads yet" : "No leads found"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {leads.length === 0
                        ? "Get started by creating your first lead or importing leads from a CSV file."
                        : "Try adjusting your search criteria or filters to find what you're looking for."
                      }
                    </p>
                    {leads.length === 0 && (
                      <div className="flex justify-center gap-3">
                        <PermissionGuard permissions="leads.import">
                          <ImportLeadsDialog onImportComplete={fetchLeads} />
                        </PermissionGuard>
                        <PermissionGuard permissions="leads.create">
                          <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Lead
                          </Button>
                        </PermissionGuard>
                      </div>
                    )}
            </div>
          )}
        </CardContent>
      </Card>
          </div>

      {/* Edit Dialog */}
      <PermissionGuard permissions="leads.edit">
        <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg -m-6 mb-6">
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Lead
                  </DialogTitle>
            </DialogHeader>
            {editingLead && (
              <LeadForm
                initialData={editingLead}
                onSubmit={handleUpdateLead}
              />
            )}
          </DialogContent>
        </Dialog>
      </PermissionGuard>
        </div>
    </div>
    </PermissionGuard>
  );
}
