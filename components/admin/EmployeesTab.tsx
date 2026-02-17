"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import Link from "next/link";
import QuickAddEmployeeDialog from "@/components/employees/QuickAddEmployeeDialog";

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

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this employee? This will permanently remove the employee and all their related data (attendance, leaves, tasks, tickets, etc.).")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete employee");
      console.error(error);
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size="lg" text="Loading employees..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Employee Management
              </CardTitle>
              <p className="text-white/90 mt-1">Manage and track your team members</p>
            </div>
            <QuickAddEmployeeDialog afterCreate={() => { fetchEmployees(); }} />
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e.status !== 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Card */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Filter className="w-5 h-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-teal-200 focus:border-teal-500 bg-white"
              />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-[200px] rounded-md border border-teal-200 focus:border-teal-500 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-[180px] rounded-md border border-teal-200 focus:border-teal-500 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Users className="w-5 h-5 mr-2" />
            Team Members
            <Badge className="ml-3 bg-teal-50 text-teal-700 border-teal-200">
              {employees.length} employees
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                {employees.length === 0 ? (
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
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
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
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
                              disabled={deletingId === employee.id}
                            >
                              {deletingId === employee.id ? (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
                              {deletingId === employee.id ? "Deleting..." : "Delete Employee"}
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
            <div className="mt-6 p-4 bg-[#e6fffa] rounded-lg border border-teal-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page <span className="font-semibold text-teal-600">{currentPage}</span> of{" "}
                  <span className="font-semibold text-teal-600">{totalPages}</span>
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
                    className="border-teal-200 hover:bg-teal-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm bg-white rounded border border-teal-200">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-teal-200 hover:bg-teal-50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
