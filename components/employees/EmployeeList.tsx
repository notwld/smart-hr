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
import { MoreVertical, Search, Filter, ChevronLeft, ChevronRight, Users, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  phone: string;
  status: string;
  legacyRole: "ADMIN" | "MANAGER" | "EMPLOYEE";
  userRoles?: { role: { name: string } }[];
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) throw new Error("Failed to fetch roles");
      
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search,
        department: department === "all" ? "" : department,
        status: status === "all" ? "" : status,
      });

      const response = await fetch(`/api/employees?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch employees");

      const data = await response.json();
      setEmployees(data.employees);
      setTotalPages(data.totalPages);
      setDepartments(data.departments);
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, [currentPage, search, department, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error(error);
    }
  };

  const updateEmployeeStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/employees/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update employee status");

      toast.success(`Employee status updated to ${newStatus}`);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to update employee status");
      console.error(error);
    }
  };

  const updateEmployeeRole = async (id: string, roleId: string) => {
    try {
      const response = await fetch(`/api/employees/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) throw new Error("Failed to update employee role");

      const role = roles.find(r => r.id === roleId);
      toast.success(`Employee role updated to ${role?.name || 'Unknown'}`);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to update employee role");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Employee Management
              </CardTitle>
              <p className="text-white/90 mt-1">Manage and track your team members</p>
            </div>
            <Button asChild className="bg-white text-cyan-600 hover:bg-gray-100">
              <Link href="/admin/employees/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter Card */}
      <Card className="border-0 shadow-sm bg-[#dff9ff]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-cyan-200 focus:border-cyan-500 bg-white"
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[200px] border-cyan-200 focus:border-cyan-500 bg-white">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px] border-cyan-200 focus:border-cyan-500 bg-white">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Department</TableHead>
                  <TableHead className="font-semibold text-gray-700">Position</TableHead>
                  <TableHead className="font-semibold text-gray-700">Role</TableHead>
                  <TableHead className="font-semibold text-gray-700">Join Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="w-[80px] font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader size="lg" text="Loading employees..." />
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No employees found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee, index) => (
                    <TableRow key={employee.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="text-gray-900">{employee.email}</p>
                          <p className="text-gray-500 text-sm">{employee.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                          {employee.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-gray-700">{employee.position}</TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${
                          employee.legacyRole === "ADMIN" 
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                            : employee.legacyRole === "MANAGER"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}>
                          {employee.userRoles && employee.userRoles.length > 0 
                            ? employee.userRoles.map(ur => ur.role.name).join(", ") 
                            : employee.legacyRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600">
                        {new Date(employee.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`${
                            employee.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : employee.status === "TERMINATED"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/employees/${employee.id}`} className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/employees/${employee.id}/edit`} className="flex items-center">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Employee
                              </Link>
                            </DropdownMenuItem>
                            
                            {/* Status SubMenu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded">
                                Update Status
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => updateEmployeeStatus(employee.id, "ACTIVE")}
                                  disabled={employee.status === "ACTIVE"}
                                >
                                  Active
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateEmployeeStatus(employee.id, "SUSPENDED")}
                                  disabled={employee.status === "SUSPENDED"}
                                >
                                  Suspended
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateEmployeeStatus(employee.id, "TERMINATED")}
                                  disabled={employee.status === "TERMINATED"}
                                >
                                  Terminated
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* Role SubMenu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded">
                                Update Role
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {roles.map((role) => {
                                  const currentRoleName = employee.userRoles?.[0]?.role?.name || 
                                                        (employee.legacyRole === "ADMIN" ? "Admin" : 
                                                         employee.legacyRole === "MANAGER" ? "Team Leader" : "Employee");
                                  
                                  return (
                                    <DropdownMenuItem 
                                      key={role.id}
                                      onClick={() => updateEmployeeRole(employee.id, role.id)}
                                      disabled={currentRoleName === role.name}
                                    >
                                      {role.name}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 flex items-center"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Employee
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
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card className="border-0 shadow-sm bg-[#dff9ff]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page <span className="font-semibold text-cyan-600">{currentPage}</span> of{" "}
              <span className="font-semibold text-cyan-600">{totalPages}</span>
              {employees.length > 0 && (
                <span className="ml-2">
                  ({employees.length} employee{employees.length !== 1 ? 's' : ''} on this page)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="px-3 py-1 text-sm bg-white rounded border border-cyan-200">
                {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 