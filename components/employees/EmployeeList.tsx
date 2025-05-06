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
import { MoreVertical, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);

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

  const updateEmployeeRole = async (id: string, newRole: string) => {
    try {
      const response = await fetch(`/api/employees/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update employee role");

      toast.success(`Employee role updated to ${newRole}`);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to update employee role");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/admin/employees/new">Add Employee</Link>
        </Button>
      </div>

      {/* Employee Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    {employee.userRoles && employee.userRoles.length > 0 
                      ? employee.userRoles.map(ur => ur.role.name).join(", ") 
                      : employee.legacyRole}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : employee.status === "TERMINATED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/employees/${employee.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/employees/${employee.id}/edit`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        
                        {/* Status SubMenu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full text-left px-2 py-1.5 text-sm">
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
                          <DropdownMenuTrigger className="w-full text-left px-2 py-1.5 text-sm">
                            Update Role
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => updateEmployeeRole(employee.id, "ADMIN")}
                              disabled={employee.legacyRole === "ADMIN"}
                            >
                              Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateEmployeeRole(employee.id, "MANAGER")}
                              disabled={employee.legacyRole === "MANAGER"}
                            >
                              Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateEmployeeRole(employee.id, "EMPLOYEE")}
                              disabled={employee.legacyRole === "EMPLOYEE"}
                            >
                              Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(employee.id)}
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 