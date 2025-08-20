"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
  User?: {
    firstName: string;
    lastName: string;
  };
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
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

  useEffect(() => {
    fetchLeads();
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
    return Array.from(new Set(leads.map(lead => lead[key]).filter(value => value && value !== "")));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <PermissionGuard 
      permissions="leads.view"
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view leads.</p>
          </div>
        </div>
      }
    >
      <div className="w-full p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">Manage your leads and track conversions</p>
          </div>
          <div className="flex items-center gap-3">
            <PermissionGuard permissions="leads.import">
              <ImportLeadsDialog onImportComplete={fetchLeads} />
            </PermissionGuard>
            <PermissionGuard permissions="leads.create">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                  </DialogHeader>
                  <LeadForm onSubmit={handleCreateLead} />
                </DialogContent>
              </Dialog>
            </PermissionGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(lead => lead.status?.toLowerCase() === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(lead => lead.status?.toLowerCase() === 'converted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${leads.reduce((sum, lead) => sum + lead.cost, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {getUniqueValues('status').map((status) => (
                  <SelectItem key={status || 'unknown'} value={status as string || 'unknown'}>
                    {status || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {getUniqueValues('platform').map((platform) => (
                  <SelectItem key={platform || 'unknown'} value={platform as string || 'unknown'}>
                    {platform || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {getUniqueValues('service').map((service) => (
                  <SelectItem key={service || 'unknown'} value={service as string || 'unknown'}>
                    {service || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.number}</TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>{lead.platform}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>${lead.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(lead.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {lead.assignee ? 
                        `${lead.assignee.firstName} ${lead.assignee.lastName}` : 
                        'Unassigned'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PermissionGuard permissions="leads.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLead(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permissions="leads.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLead(lead.id)}
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
            <div className="text-center py-8 text-muted-foreground">
              No leads found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <PermissionGuard permissions="leads.edit">
        <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
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
    </PermissionGuard>
  );
}
