"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, EyeOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/contexts/PermissionContext";
import PermissionGuard from "@/components/PermissionGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export default function PermissionsPage() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions");
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
        
        // Extract unique resources for filtering
        const uniqueResources = Array.from(
          new Set(data.map((permission: Permission) => permission.resource))
        ) as string[];
        setResources(uniqueResources.sort());
      } else {
        toast.error("Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Error loading permissions");
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter((permission) => {
    const searchMatch =
      searchTerm === "" ||
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description &&
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const resourceMatch = resourceFilter === "all" || permission.resource === resourceFilter;
    
    return searchMatch && resourceMatch;
  });

  // Group permissions by resource
  const groupedPermissions: Record<string, Permission[]> = {};
  
  filteredPermissions.forEach((permission) => {
    if (!groupedPermissions[permission.resource]) {
      groupedPermissions[permission.resource] = [];
    }
    groupedPermissions[permission.resource].push(permission);
  });

  if (loading) return <div>Loading...</div>;

  return (
    <PermissionGuard permissions="roles.view" fallback={<div>You don't have permission to view this page.</div>}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Permissions</h1>
            <p className="text-gray-500 mt-1">View and manage system permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Permissions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search permissions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Select
                  value={resourceFilter}
                  onValueChange={setResourceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {resources.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[600px]">
              {Object.keys(groupedPermissions).length > 0 ? (
                Object.entries(groupedPermissions)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([resource, permissions]) => (
                    <div key={resource} className="mb-8">
                      <h3 className="text-lg font-semibold mb-3 capitalize flex items-center">
                        <Badge variant="outline" className="mr-2 px-2 py-1">
                          {resource}
                        </Badge>
                        <span>{resource} Management</span>
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Permission</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permissions.map((permission) => (
                              <TableRow key={permission.id}>
                                <TableCell className="font-medium">
                                  {permission.name}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {permission.action}
                                </TableCell>
                                <TableCell>
                                  {permission.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No permissions found.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
} 