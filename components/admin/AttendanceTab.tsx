"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  Search, 
  Filter, 
  Plus,
  FileText,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Loader, ButtonLoader } from "@/components/ui/loader";
import { toast } from "sonner";
import EmployeeCalendar from "@/components/EmployeeCalendar";

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  totalBreakTime: number | null;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    pfp: string | null;
  };
}

interface AttendanceData {
  attendance: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  departments: string[];
  availableMonths?: string[];
}

export default function AttendanceTab() {
  const [showCreateAttendanceDialog, setShowCreateAttendanceDialog] = useState(false);
  const [showImportAttendanceDialog, setShowImportAttendanceDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    userId: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isCreatingAttendance, setIsCreatingAttendance] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [exportMonth, setExportMonth] = useState(() => {
    // Default to current month in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Attendance table state
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        department: selectedDepartment,
        status: selectedStatus,
      });

      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`/api/attendance/admin?${params}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
        if (data.availableMonths) {
          setAvailableMonths(data.availableMonths);
        }
      } else {
        console.error('Failed to fetch attendance data:', response.statusText);
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('Request timed out');
      } else {
        console.error('Error fetching attendance data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedDepartment, selectedStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handleCreateAttendance = () => {
    setShowCreateAttendanceDialog(true);
    if (users.length === 0) {
      fetchUsers();
    }
  };

  const handleImportAttendance = () => {
    setShowImportAttendanceDialog(true);
  };

  const handleExportAttendance = () => {
    setShowExportDialog(true);
  };

  const handleExportSubmit = async () => {
    if (!exportMonth) {
      toast.error('Please select a month');
      return;
    }

    const [year, month] = exportMonth.split('-').map(Number);
    if (!year || !month) {
      toast.error('Invalid month format');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/attendance/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, month }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error: ${error.message || 'Failed to export attendance'}`);
        return;
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'attendance-export.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Attendance exported successfully!');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Error exporting attendance data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateAttendanceSubmit = async () => {
    if (!attendanceForm.userId || !attendanceForm.date) {
      toast.error('Please select a user and date');
      return;
    }

    setIsCreatingAttendance(true);
    try {
      const response = await fetch('/api/attendance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceForm),
      });

      if (response.ok) {
        toast.success('Attendance record created successfully');
        setShowCreateAttendanceDialog(false);
        setAttendanceForm({
          userId: '',
          date: '',
          checkInTime: '',
          checkOutTime: '',
        });
        fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error('Error creating attendance record');
    } finally {
      setIsCreatingAttendance(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }

    if (isImporting) {
      toast.error('Import already in progress. Please wait...');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error('Import timed out. Please try with a smaller file or contact support.');
      }, 300000);

      const response = await fetch('/api/attendance/import', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const { results } = result;
        
        toast.success(`Import completed! Processed: ${results.totalProcessed}, Created: ${results.totalCreated}, Skipped: ${results.totalSkipped}`);
        
        if (results.totalCreated > 0) {
          setShowImportAttendanceDialog(false);
          setImportFile(null);
          setDebugResults(null);
          fetchAttendanceData();
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Unknown error occurred';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error importing attendance:', error);
      if (error?.name === 'AbortError') {
        return;
      }
      toast.error('Error importing attendance data: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDebugFile = async () => {
    if (!importFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsDebugging(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/attendance/debug-import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDebugResults(result.debugInfo);
      } else {
        const error = await response.json();
        toast.error(`Debug Error: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error debugging file:', error);
      toast.error('Error analyzing file');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    setShowCalendar(true);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBreakTime = (minutes: number | null | undefined) => {
    if (!minutes || minutes === 0) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatWorkingHours = (hours: number | null | undefined) => {
    if (!hours || hours === 0) return "-";
    return `${hours.toFixed(2)}h`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PRESENT: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
      LATE: "bg-yellow-100 text-yellow-800",
      HALF_DAY: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatMonthLabel = (monthKey: string) => {
    // monthKey is in format "YYYY-MM"
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthName}-${year}`;
  };

  const handleMonthSelect = (monthKey: string) => {
    // monthKey is in format "YYYY-MM"
    const [year, month] = monthKey.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // First day of the month (1st)
    const dateFromStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    
    // Last day of the month
    const lastDay = new Date(yearNum, monthNum, 0);
    const lastDayDate = lastDay.getDate();
    const dateToStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDayDate).padStart(2, '0')}`;
    
    setDateFrom(dateFromStr);
    setDateTo(dateToStr);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Employee Attendance Management
              </CardTitle>
              <p className="text-white/90 mt-1">Monitor and manage employee attendance records</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleExportAttendance}
                variant="outline" 
                className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleCreateAttendance}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Attendance
              </Button>
              <Button 
                onClick={handleImportAttendance}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Import Attendance
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Filter className="w-5 h-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Employees</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full rounded-md border border-cyan-200 focus:border-cyan-500 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Departments</option>
                {attendanceData?.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-cyan-200 focus:border-cyan-500 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>
          
          {/* Quick Select Months */}
          {availableMonths.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {availableMonths.map((monthKey) => (
                  <Button
                    key={monthKey}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMonthSelect(monthKey)}
                    className={`text-sm border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 ${
                      dateFrom && dateTo && 
                      dateFrom.startsWith(monthKey) && 
                      dateTo.startsWith(monthKey)
                        ? 'bg-cyan-100 border-cyan-500 text-cyan-700 font-semibold'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {formatMonthLabel(monthKey)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Clock className="w-5 h-5 mr-2" />
            Employee Attendance Records
            {attendanceData && (
              <Badge className="ml-3 bg-cyan-50 text-cyan-700 border-cyan-200">
                {attendanceData.pagination.total} total records
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader size="lg" text="Loading attendance records..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                      <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Check In</TableHead>
                      <TableHead className="font-semibold text-gray-700">Check Out</TableHead>
                      <TableHead className="font-semibold text-gray-700">Break Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Working Hours</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData?.attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <Clock className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-2">No attendance records found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceData?.attendance.map((record, index) => (
                        <TableRow key={record.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {record.user.firstName.charAt(0)}{record.user.lastName.charAt(0)}
                              </div>
                              <div>
                                <button
                                  onClick={() => handleEmployeeClick(record.user)}
                                  className="text-sm font-medium text-gray-900 hover:text-cyan-600 hover:underline cursor-pointer transition-colors"
                                >
                                  {record.user.firstName} {record.user.lastName}
                                </button>
                                <div className="text-xs text-gray-500">
                                  {record.user.position}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                              {record.user.department}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 font-medium text-gray-700">{formatDate(record.date)}</TableCell>
                          <TableCell className="py-4 font-mono text-gray-700">{formatTime(record.checkInTime)}</TableCell>
                          <TableCell className="py-4 font-mono text-gray-700">{formatTime(record.checkOutTime)}</TableCell>
                          <TableCell className="py-4 font-semibold text-gray-800">
                            {formatBreakTime(record.totalBreakTime)}
                          </TableCell>
                          <TableCell className="py-4 font-semibold text-gray-800">
                            {formatWorkingHours(record.totalHours)}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className={`rounded-md font-medium ${getStatusBadge(record.status)}`}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEmployeeClick(record.user)}
                              className="h-8 w-8 p-0 hover:bg-cyan-50 border-cyan-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {attendanceData && attendanceData.pagination.totalPages > 1 && (
                <div className="mt-6 p-4 bg-[#dff9ff] rounded-lg border border-cyan-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing page <span className="font-semibold text-cyan-600">{currentPage}</span> of{" "}
                      <span className="font-semibold text-cyan-600">{attendanceData.pagination.totalPages}</span>
                      <span className="ml-2">
                        ({((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, attendanceData.pagination.total)} of {attendanceData.pagination.total} records)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                        onClick={() => setCurrentPage(prev => Math.min(attendanceData.pagination.totalPages, prev + 1))}
                        disabled={currentPage === attendanceData.pagination.totalPages}
                        className="border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs and Calendar - keeping existing dialogs with updated styling */}
      {/* Create Attendance Dialog */}
      <Dialog open={showCreateAttendanceDialog} onOpenChange={setShowCreateAttendanceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Attendance Record
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="employee" className="text-sm font-medium text-gray-700">
                Employee
              </label>
              <select 
                className="w-full rounded-md border border-cyan-200 focus:border-cyan-500 bg-white px-3 py-2 text-sm"
                value={attendanceForm.userId}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, userId: e.target.value }))}
                disabled={loadingUsers}
              >
                <option value="">Select Employee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.department}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date
              </label>
              <Input
                id="date"
                type="date"
                className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="checkin" className="text-sm font-medium text-gray-700">
                  Check In Time
                </label>
                <Input
                  id="checkin"
                  type="time"
                  className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                  value={attendanceForm.checkInTime}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="checkout" className="text-sm font-medium text-gray-700">
                  Check Out Time
                </label>
                <Input
                  id="checkout"
                  type="time"
                  className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                  value={attendanceForm.checkOutTime}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateAttendanceDialog(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
              onClick={handleCreateAttendanceSubmit}
              disabled={isCreatingAttendance}
            >
              {isCreatingAttendance ? (
                <ButtonLoader size="sm" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Record
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog - simplified for space */}
      <Dialog open={showImportAttendanceDialog} onOpenChange={setShowImportAttendanceDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Import Attendance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Excel File</label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowImportAttendanceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportSubmit}
              disabled={isImporting || !importFile}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isImporting ? <ButtonLoader size="sm" /> : 'Import'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export Attendance Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="exportMonth" className="text-sm font-medium text-gray-700">
                Select Month
              </label>
              <Input
                id="exportMonth"
                type="month"
                className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                The export will include all days in the selected month, with one sheet per day.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(false)}
              className="border-gray-300 hover:bg-gray-50"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
              onClick={handleExportSubmit}
              disabled={isExporting || !exportMonth}
            >
              {isExporting ? (
                <ButtonLoader size="sm" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Calendar */}
      <EmployeeCalendar
        isOpen={showCalendar}
        onClose={() => {
          setShowCalendar(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />
    </div>
  );
}
