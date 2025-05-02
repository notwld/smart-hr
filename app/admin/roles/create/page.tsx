"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/PermissionContext";
import PermissionGuard from "@/components/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export default function CreateRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    // Group permissions by resource
    const grouped: Record<string, Permission[]> = {};
    
    permissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    
    setGroupedPermissions(grouped);
  }, [permissions]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions");
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
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

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  const handleSelectAllInGroup = (resourcePermissions: Permission[], isChecked: boolean) => {
    if (isChecked) {
      const permissionIds = resourcePermissions.map(p => p.id);
      
      // Add all permissions from this resource that aren't already selected
      const newPermissions = [...selectedPermissions];
      permissionIds.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      
      setSelectedPermissions(newPermissions);
    } else {
      // Remove all permissions from this resource
      const permissionIds = resourcePermissions.map(p => p.id);
      setSelectedPermissions(selectedPermissions.filter(id => !permissionIds.includes(id)));
    }
  };

  const handleSubmit = async () => {
    if (!roleName) {
      toast.error("Role name is required");
      return;
    }

    try {
      setSubmitting(true);
      
      // First create the role
      const createRoleResponse = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roleName,
          description: roleDescription,
          isDefault: isDefault,
        }),
      });

      if (!createRoleResponse.ok) {
        const error = await createRoleResponse.json();
        throw new Error(error.message || "Failed to create role");
      }

      const createdRole = await createRoleResponse.json();
      
      // Now assign permissions
      if (selectedPermissions.length > 0) {
        // Add permissions one by one to avoid request size issues
        for (const permissionId of selectedPermissions) {
          await fetch(`/api/admin/roles/${createdRole.id}/permissions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ permissionId }),
          });
        }
      }
      
      toast.success("Role created successfully with assigned permissions");
      router.push("/admin/roles");
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error(error instanceof Error ? error.message : "Error creating role");
    } finally {
      setSubmitting(false);
    }
  };

  const isGroupFullySelected = (permissions: Permission[]) => {
    return permissions.every(p => selectedPermissions.includes(p.id));
  };

  const isGroupPartiallySelected = (permissions: Permission[]) => {
    return permissions.some(p => selectedPermissions.includes(p.id)) && 
           !permissions.every(p => selectedPermissions.includes(p.id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <PermissionGuard permissions="roles.create" fallback={<div>You don't have permission to access this page.</div>}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-4"
              onClick={() => router.push("/admin/roles")}
            >
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Role</h1>
              <p className="text-gray-500 mt-1">Define a new role and assign permissions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Role Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Role Details</CardTitle>
                <CardDescription>Basic information about the role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Role Name</label>
                  <Input
                    id="name"
                    placeholder="Enter role name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    placeholder="Enter role description"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(!!checked)}
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Default role for new users
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit} 
                  disabled={submitting || !roleName}
                >
                  {submitting ? "Creating..." : "Create Role"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Permissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Select permissions for this role</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(groupedPermissions)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([resource, permissions]) => (
                        <AccordionItem key={resource} value={resource}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center">
                              <Checkbox
                                id={`resource-${resource}`}
                                checked={isGroupFullySelected(permissions)}
                                indeterminate={!isGroupFullySelected(permissions) && isGroupPartiallySelected(permissions)}
                                onCheckedChange={(checked) => handleSelectAllInGroup(permissions, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="mr-2"
                              />
                              <span className="capitalize">{resource}</span>
                              <Badge variant="outline" className="ml-2">
                                {permissions.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="ml-6 space-y-2">
                              {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                    <label
                                      htmlFor={`permission-${permission.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {permission.name}
                                    </label>
                                    {permission.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedPermissions([])}>
                  Clear All
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || !roleName}
                >
                  {submitting ? "Creating..." : "Create Role"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
} 