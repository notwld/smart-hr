"use client"
import React, { useState, useEffect } from "react"
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Plus,
  Search,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PermissionGuard from "@/components/PermissionGuard"

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
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
}

export default function AdminDashboard() {
  const [showCreateAttendanceDialog, setShowCreateAttendanceDialog] = useState(false);
  const [showImportAttendanceDialog, setShowImportAttendanceDialog] = useState(false);
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
  const [debugResults, setDebugResults] = useState<any>(null);
  
  // Attendance table state
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/attendance/create');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAttendanceData = async () => {
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

      const response = await fetch(`/api/attendance/admin?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        console.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage, searchTerm, selectedDepartment, selectedStatus, dateFrom, dateTo]);

  const handleCreateAttendance = () => {
    setShowCreateAttendanceDialog(true);
    if (users.length === 0) {
      fetchUsers();
    }
  };

  const handleImportAttendance = () => {
    setShowImportAttendanceDialog(true);
  };

  const handleCreateAttendanceSubmit = async () => {
    if (!attendanceForm.userId || !attendanceForm.date) {
      alert('Please select a user and date');
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
        alert('Attendance record created successfully');
        setShowCreateAttendanceDialog(false);
        setAttendanceForm({
          userId: '',
          date: '',
          checkInTime: '',
          checkOutTime: '',
        });
        fetchAttendanceData(); // Refresh the table
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Error creating attendance record');
    } finally {
      setIsCreatingAttendance(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      alert('Please select a file');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/attendance/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const { results } = result;
        
        let message = `Import completed!\nProcessed: ${results.totalProcessed}\nCreated: ${results.totalCreated}\nSkipped: ${results.totalSkipped}`;
        
        if (results.errors && results.errors.length > 0) {
          message += `\nErrors: ${results.errors.length}`;
          
          if (results.errors.length <= 10) {
            message += '\n\nFirst few errors:\n' + results.errors.slice(0, 5).join('\n');
          } else {
            message += '\n\nFirst 5 errors:\n' + results.errors.slice(0, 5).join('\n');
            message += '\n\n(Use Debug button to see detailed analysis)';
          }
        }
        
        alert(message);
        
        if (results.totalCreated > 0) {
          setShowImportAttendanceDialog(false);
          setImportFile(null);
          setDebugResults(null);
          fetchAttendanceData(); // Refresh the table
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error importing attendance:', error);
      alert('Error importing attendance data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDebugFile = async () => {
    if (!importFile) {
      alert('Please select a file first');
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
        alert(`Debug Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error debugging file:', error);
      alert('Error analyzing file');
    } finally {
      setIsDebugging(false);
    }
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

  const getStatusBadge = (status: string) => {
    const colors = {
      PRESENT: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
      LATE: "bg-yellow-100 text-yellow-800",
      HALF_DAY: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Employee Attendance</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span>Attendance Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <PermissionGuard permissions={["attendance.create", "attendance.import"]} requireAll={false}>
            <Button size="sm" variant="outline" className="gap-1 bg-[#E8F5E8] text-[#198754]" onClick={handleCreateAttendance}>
              <Plus className="h-4 w-4" />
              Create Attendance
            </Button>
            <Button size="sm" variant="outline" className="gap-1 bg-[#F8F9FA] text-[#6C757D]" onClick={handleImportAttendance}>
              <FileText className="h-4 w-4" />
              Import Attendance
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Departments</option>
                {attendanceData?.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Employee Attendance Records
            {attendanceData && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({attendanceData.pagination.total} total records)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData?.attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={record.user.pfp || `/placeholder.svg?height=32&width=32&text=${record.user.firstName.charAt(0)}`}
                              alt={record.user.firstName}
                            />
                            <AvatarFallback>{record.user.firstName.charAt(0)}{record.user.lastName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              {record.user.firstName} {record.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.user.position}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md">
                          {record.user.department}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{formatTime(record.checkInTime)}</TableCell>
                      <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                      <TableCell>
                        {record.totalHours ? `${record.totalHours.toFixed(2)}h` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {attendanceData && attendanceData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, attendanceData.pagination.total)} of {attendanceData.pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {attendanceData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(attendanceData.pagination.totalPages, prev + 1))}
                      disabled={currentPage === attendanceData.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Attendance Dialog */}
      <Dialog open={showCreateAttendanceDialog} onOpenChange={setShowCreateAttendanceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="employee" className="text-right">
                Employee
              </label>
              <select 
                className="col-span-3 rounded border p-2"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">
                Date
              </label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="checkin" className="text-right">
                Check In
              </label>
              <Input
                id="checkin"
                type="time"
                className="col-span-3"
                value={attendanceForm.checkInTime}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="checkout" className="text-right">
                Check Out
              </label>
              <Input
                id="checkout"
                type="time"
                className="col-span-3"
                value={attendanceForm.checkOutTime}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateAttendanceDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#198754] hover:bg-[#198754]/90"
              onClick={handleCreateAttendanceSubmit}
              disabled={isCreatingAttendance}
            >
              {isCreatingAttendance ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Attendance Dialog */}
      <Dialog open={showImportAttendanceDialog} onOpenChange={setShowImportAttendanceDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Attendance from Excel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="excel-file" className="text-sm font-medium">
                Select Excel File
              </label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                className="cursor-pointer"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  setDebugResults(null); // Clear previous debug results
                }}
              />
              <p className="text-xs text-muted-foreground">
                Excel file should contain sheets named with employee names and columns: Index, Person ID, Name, Department, Position, Gender, Date, Day Of Week, Timetable, First-In, Last-Out
              </p>
            </div>
            
            {importFile && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDebugFile}
                  disabled={isDebugging}
                >
                  {isDebugging ? "Analyzing..." : "🔍 Debug File"}
                </Button>
                <span className="text-sm text-muted-foreground flex items-center">
                  Analyze file structure before importing
                </span>
              </div>
            )}

            {debugResults && (
              <div className="mt-4 space-y-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <h4 className="text-sm font-medium mb-2">📊 File Analysis Results</h4>
                  <div className="text-xs space-y-2">
                    <p><strong>File:</strong> {debugResults.fileName} ({(debugResults.fileSize / 1024).toFixed(1)} KB)</p>
                    <p><strong>Sheets:</strong> {debugResults.sheetNames.join(', ')}</p>
                    <p><strong>Database Users:</strong> {debugResults.databaseUsers.length} employees found</p>
                  </div>
                </div>

                {debugResults.sheetsInfo.map((sheet: any, index: number) => (
                  <div key={index} className="rounded-md bg-gray-50 p-3">
                    <h5 className="text-sm font-medium">📋 Sheet: {sheet.sheetName}</h5>
                    <div className="text-xs mt-2 space-y-1">
                      <p><strong>Rows:</strong> {sheet.totalRows}</p>
                      <p><strong>Columns:</strong> {sheet.columns.join(', ')}</p>
                      
                      {sheet.uniqueNames && sheet.uniqueNames.length > 0 && (
                        <div>
                          <p><strong>Sample Names:</strong></p>
                          <ul className="ml-4 list-disc">
                            {sheet.uniqueNames.slice(0, 5).map((name: string, i: number) => {
                              const matchedUser = debugResults.databaseUsers.find((u: any) => 
                                u.name.toLowerCase().includes(name.toLowerCase()) ||
                                name.toLowerCase().includes(u.name.toLowerCase())
                              );
                              return (
                                <li key={i} className={matchedUser ? "text-green-600" : "text-red-600"}>
                                  {name} {matchedUser ? "✓" : "❌"}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {sheet.dateFormats && sheet.dateFormats.length > 0 && (
                        <p><strong>Date Formats:</strong> {sheet.dateFormats.join(', ')}</p>
                      )}

                      {sheet.timeFormats && (
                        <div>
                          <p><strong>Time Formats:</strong></p>
                          {sheet.timeFormats.firstIn.length > 0 && (
                            <p className="ml-2">Check-in: {sheet.timeFormats.firstIn.join(', ')}</p>
                          )}
                          {sheet.timeFormats.lastOut.length > 0 && (
                            <p className="ml-2">Check-out: {sheet.timeFormats.lastOut.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {debugResults.databaseUsers.length > 0 && (
                  <div className="rounded-md bg-green-50 p-3">
                    <h5 className="text-sm font-medium">👥 Available Employees in Database</h5>
                    <div className="text-xs mt-2">
                      <p className="mb-1"><strong>Sample employees:</strong></p>
                      <ul className="ml-4 list-disc">
                        {debugResults.databaseUsers.slice(0, 8).map((user: any, i: number) => (
                          <li key={i}>{user.name} ({user.username})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-md bg-muted p-3">
              <h4 className="text-sm font-medium mb-2">Expected Format:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Multiple sheets named with employee names</li>
                <li>• Index, Person ID, Name, Department, Position, Gender</li>
                <li>• Date, Day Of Week, Timetable, First-In, Last-Out</li>
                <li>• Alternative column names: "First In", "Check In", "Time In" for check-in</li>
                <li>• Alternative column names: "Last Out", "Check Out", "Time Out" for check-out</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowImportAttendanceDialog(false);
              setDebugResults(null);
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-[#6C757D] hover:bg-[#6C757D]/90"
              onClick={handleImportSubmit}
              disabled={isImporting || !importFile}
            >
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}