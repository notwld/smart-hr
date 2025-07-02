"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search, ChevronLeft, ChevronRight, Server, Calendar, DollarSign, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Hosting {
  id: string;
  domain: string;
  cost: number;
  startDate: string;
  expiryDate: string;
  durationType: "MONTHLY" | "YEARLY" | "CUSTOM";
  notes?: string;
  client: Client;
  createdAt: string;
  updatedAt: string;
}

export default function HostingList() {
  const [hostings, setHostings] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [durationType, setDurationType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [durationTypes, setDurationTypes] = useState<string[]>([]);

  const fetchHostings = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search,
        status: status === "all" ? "" : status,
        durationType: durationType === "all" ? "" : durationType,
      });

      const response = await fetch(`/api/hosting?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch hostings");

      const data = await response.json();
      setHostings(data.hostings);
      setTotalPages(data.totalPages);
      setDurationTypes(data.durationTypes);
    } catch (error) {
      toast.error("Failed to fetch hostings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostings();
  }, [currentPage, search, status, durationType]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hosting?")) return;

    try {
      const response = await fetch(`/api/hosting/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete hosting");

      toast.success("Hosting deleted successfully");
      fetchHostings();
    } catch (error) {
      toast.error("Failed to delete hosting");
      console.error(error);
    }
  };

  const getStatusBadge = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  const getDurationTypeBadge = (type: string) => {
    const colors = {
      MONTHLY: "bg-blue-100 text-blue-800",
      YEARLY: "bg-purple-100 text-purple-800",
      CUSTOM: "bg-gray-100 text-gray-800",
    };
    return <Badge variant="secondary" className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by domain or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={durationType} onValueChange={setDurationType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            {durationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/admin/hosting/new">Add Hosting</Link>
        </Button>
      </div>

      {/* Hosting Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : hostings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No hostings found
                </TableCell>
              </TableRow>
            ) : (
              hostings.map((hosting) => (
                <TableRow key={hosting.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-gray-400" />
                      {hosting.domain}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {hosting.client.firstName} {hosting.client.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hosting.client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      ${hosting.cost}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getDurationTypeBadge(hosting.durationType)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {format(new Date(hosting.startDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {format(new Date(hosting.expiryDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(hosting.expiryDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/hosting/${hosting.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(hosting.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 