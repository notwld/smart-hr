"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, User, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermissions } from "@/contexts/PermissionContext";
import PermissionGuard from "@/components/PermissionGuard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  department: string;
  position: string;
  legacyRole: string;
  status: string;
  userRoles: {
    role: {
      id: string;
      name: string;
    }
  }[];
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error loading roles");
    }
  };

  const handleOpenRolesDialog = (user: UserData) => {
    setSelectedUser(user);
    
    // Initialize selected roles based on user's current roles
    const initialSelectedRoles: Record<string, boolean> = {};
    roles.forEach(role => {
      initialSelectedRoles[role.id] = user.userRoles.some(ur => ur.role.id === role.id);
    });
    
    setSelectedRoles(initialSelectedRoles);
    setShowRoleDialog(true);
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setSelectedRoles({
      ...selectedRoles,
      [roleId]: checked,
    });
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      const rolesToAdd = Object.entries(selectedRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([roleId]) => roleId);

      const response = await fetch(`/api/admin/users/${selectedUser.id}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleIds: rolesToAdd }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update users state
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
        
        setShowRoleDialog(false);
        toast.success("User roles updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update user roles");
      }
    } catch (error) {
      console.error("Error updating user roles:", error);
      toast.error("Error updating user roles");
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchTermLower) ||
      user.lastName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.username.toLowerCase().includes(searchTermLower) ||
      user.department.toLowerCase().includes(searchTermLower) ||
      user.position.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <PermissionGuard permissions="users.view" fallback={<div>You don't have permission to view this page.</div>}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500 mt-1">Manage users and their roles</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.userRoles.map((userRole) => (
                            <Badge key={userRole.role.id} variant="secondary">
                              {userRole.role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "ACTIVE" ? "success" : "destructive"}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permissions="roles.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRolesDialog(user)}
                          >
                            Manage Roles
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Assign Roles Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage User Roles</DialogTitle>
              <DialogDescription>
                {selectedUser && `Assign roles to ${selectedUser.firstName} ${selectedUser.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] mt-4">
              <div className="space-y-4 pr-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3 py-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles[role.id] || false}
                      onCheckedChange={(checked) => handleRoleChange(role.id, !!checked)}
                    />
                    <div>
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {role.name}
                      </label>
                      {role.description && (
                        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRoles}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
} 