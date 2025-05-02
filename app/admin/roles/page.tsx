"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle, Trash2, Edit2, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/contexts/PermissionContext";
import PermissionGuard from "@/components/PermissionGuard";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
}

export default function RolesPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    isDefault: false,
  });
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        if (data.length > 0 && !selectedRole) {
          setSelectedRole(data[0].id);
          fetchRolePermissions(data[0].id);
        }
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error loading roles");
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setRolePermissions({
          ...rolePermissions,
          [roleId]: data.map((rp: RolePermission) => rp.permissionId),
        });
      } else {
        toast.error("Failed to fetch role permissions");
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      toast.error("Error loading role permissions");
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRole),
      });

      if (response.ok) {
        const createdRole = await response.json();
        setRoles([...roles, createdRole]);
        setShowNewRoleDialog(false);
        setNewRole({
          name: "",
          description: "",
          isDefault: false,
        });
        toast.success("Role created successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Error creating role");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingRole),
      });

      if (response.ok) {
        const updatedRole = await response.json();
        setRoles(roles.map(role => role.id === updatedRole.id ? updatedRole : role));
        setShowEditRoleDialog(false);
        setEditingRole(null);
        toast.success("Role updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role? This will affect users assigned to this role.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoles(roles.filter(role => role.id !== roleId));
        if (selectedRole === roleId) {
          const nextRole = roles.find(role => role.id !== roleId);
          if (nextRole) {
            setSelectedRole(nextRole.id);
            fetchRolePermissions(nextRole.id);
          } else {
            setSelectedRole(null);
          }
        }
        toast.success("Role deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Error deleting role");
    }
  };

  const handlePermissionChange = async (permissionId: string, checked: boolean) => {
    if (!selectedRole) return;

    try {
      if (checked) {
        // Add permission to role
        const response = await fetch(`/api/admin/roles/${selectedRole}/permissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissionId }),
        });

        if (response.ok) {
          setRolePermissions({
            ...rolePermissions,
            [selectedRole]: [...(rolePermissions[selectedRole] || []), permissionId],
          });
          toast.success("Permission added to role");
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to add permission to role");
        }
      } else {
        // Remove permission from role
        const response = await fetch(`/api/admin/roles/${selectedRole}/permissions/${permissionId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setRolePermissions({
            ...rolePermissions,
            [selectedRole]: (rolePermissions[selectedRole] || []).filter(id => id !== permissionId),
          });
          toast.success("Permission removed from role");
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to remove permission from role");
        }
      }
    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error("Error updating role permissions");
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      permission.name.toLowerCase().includes(searchTermLower) ||
      permission.resource.toLowerCase().includes(searchTermLower) ||
      permission.action.toLowerCase().includes(searchTermLower) ||
      (permission.description && permission.description.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <PermissionGuard permissions="roles.view" fallback={<div>You don't have permission to view this page.</div>}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-gray-500 mt-1">Create and manage roles and their permissions</p>
          </div>
          <PermissionGuard permissions="roles.create">
            <Button onClick={() => router.push("/admin/roles/create")}>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Role
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Roles List */}
          <Card className="col-span-12 md:col-span-4">
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                      selectedRole === role.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedRole(role.id);
                      if (!rolePermissions[role.id]) {
                        fetchRolePermissions(role.id);
                      }
                    }}
                  >
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      {role.description && <p className="text-sm">{role.description}</p>}
                      {role.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Default</span>}
                    </div>
                    <div className="flex space-x-2">
                      <PermissionGuard permissions="roles.edit">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/roles/edit/${role.id}`);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permissions="roles.delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions List */}
          <Card className="col-span-12 md:col-span-8">
            <CardHeader>
              <CardTitle>
                {selectedRole ? `Permissions for ${roles.find(r => r.id === selectedRole)?.name}` : "Permissions"}
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search permissions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <PermissionGuard permissions="roles.edit">
                            <Checkbox
                              checked={selectedRole ? rolePermissions[selectedRole]?.includes(permission.id) : false}
                              disabled={!selectedRole}
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                            />
                          </PermissionGuard>
                        </TableCell>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.resource}</TableCell>
                        <TableCell>{permission.action}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Create Role Dialog */}
        <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Enter the details for the new role.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Role name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input
                  id="description"
                  value={newRole.description || ""}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={newRole.isDefault}
                  onCheckedChange={(checked) => setNewRole({ ...newRole, isDefault: !!checked })}
                />
                <label htmlFor="isDefault" className="text-sm font-medium">Default role for new users</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRoleDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update the role details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  value={editingRole?.name || ""}
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, name: e.target.value } : null)}
                  placeholder="Role name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Input
                  id="edit-description"
                  value={editingRole?.description || ""}
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, description: e.target.value } : null)}
                  placeholder="Role description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isDefault"
                  checked={editingRole?.isDefault || false}
                  onCheckedChange={(checked) => setEditingRole(editingRole ? { ...editingRole, isDefault: !!checked } : null)}
                />
                <label htmlFor="edit-isDefault" className="text-sm font-medium">Default role for new users</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateRole}>Update Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
} 