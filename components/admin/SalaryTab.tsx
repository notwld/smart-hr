"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  Calendar,
  Users,
  Edit,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  totalBreakTime: number | null;
  status: string;
}

interface DayData {
  date: string;
  dayName: string;
  dateFormatted: string; // DD, MM, YYYY
  attendance: AttendanceRecord | null;
  productiveHours: number;
  salaryDeduction: number;
  isPresent: boolean;
  isAbsent: boolean;
  isLeave: boolean;
  isEditable: boolean;
  editedCheckIn?: string;
  editedCheckOut?: string;
  editedBreakTime?: number;
}

interface SummaryData {
  totalSalaryDeducted: number;
  tax: number;
  totalSalary: number;
  totalSalaryAfterDeduction: number;
  totalDaysPresent: number;
  totalDaysAbsent: number;
  totalWorkingHours: number;
  totalProductiveHours: number;
}

export default function SalaryTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [editingField, setEditingField] = useState<{day: string, field: string} | null>(null);
  const [summary, setSummary] = useState<SummaryData>({
    totalSalaryDeducted: 0,
    tax: 0,
    totalSalary: 0,
    totalSalaryAfterDeduction: 0,
    totalDaysPresent: 0,
    totalDaysAbsent: 0,
    totalWorkingHours: 0,
    totalProductiveHours: 0,
  });
  const [taxInput, setTaxInput] = useState<string>("");
  const [showTaxInput, setShowTaxInput] = useState(false);
  const [leaveUpdateTrigger, setLeaveUpdateTrigger] = useState(0);

  // Load tax from localStorage
  useEffect(() => {
    const savedTax = localStorage.getItem('employeeTax');
    if (savedTax) {
      setTaxInput(savedTax);
      setSummary(prev => ({ ...prev, tax: parseFloat(savedTax) || 0 }));
    }
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Fetch all employees by getting all pages
        let allEmployees: Employee[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`/api/employees?page=${page}`);
          if (response.ok) {
            const data = await response.json();
            if (data.employees && data.employees.length > 0) {
              allEmployees = [...allEmployees, ...data.employees];
              page++;
              hasMore = page <= (data.totalPages || 1);
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setEmployees(allEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance data when employee and month are selected
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const response = await fetch(
        `/api/attendance/employee/${selectedEmployee.id}?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.attendance || []);
      } else {
        toast.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedMonth]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Calculate days data and summary
  useEffect(() => {
    if (!selectedEmployee || !selectedMonth) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const salary = selectedEmployee.salary || 0;
    
    // If salary is not available, show warning
    if (!selectedEmployee.salary || selectedEmployee.salary === 0) {
      console.warn(`Salary not available for employee ${selectedEmployee.id}`);
    }
    
    const expectedHoursPerDay = 9; // 9 hours per day
    const expectedMinutesPerDay = expectedHoursPerDay * 60; // 540 minutes

    const days: DayData[] = [];
    const attendanceMap = new Map<string, AttendanceRecord>();
    attendanceData.forEach(record => {
      const dateKey = record.date;
      attendanceMap.set(dateKey, record);
    });

    let totalSalaryDeducted = 0;
    let totalDaysPresent = 0;
    let totalDaysAbsent = 0;
    let totalWorkingHours = 0;
    let totalProductiveHours = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      const attendance = attendanceMap.get(dateKey) || null;

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateFormatted = `${String(day).padStart(2, '0')}, ${String(month).padStart(2, '0')}, ${year}`;

      let workingHours = attendance?.totalHours || 0;
      let breakTime = attendance?.totalBreakTime || 0;
      let productiveHours = workingHours - (breakTime / 60);

      // Check if this day is marked as leave (from localStorage)
      const leaveKey = `${selectedEmployee.id}-${dateKey}`;
      const isLeave = localStorage.getItem(leaveKey) === 'true';

      const isPresent = attendance?.status === 'PRESENT' && (attendance.checkInTime || attendance.checkOutTime);
      const isAbsent = !isPresent && !isLeave;

      // Calculate salary deduction: if(productiveHours < 9, ((salary/(daysInMonth*540))*(540-productiveHours*60)), 0)
      // But only if not a leave
      let salaryDeduction = 0;
      if (!isLeave && productiveHours < expectedHoursPerDay) {
        const deductionPerMinute = salary / (daysInMonth * expectedMinutesPerDay);
        const missingMinutes = expectedMinutesPerDay - (productiveHours * 60);
        salaryDeduction = deductionPerMinute * missingMinutes;
      }

      totalSalaryDeducted += salaryDeduction;
      if (isPresent) totalDaysPresent++;
      if (isAbsent && !isLeave) totalDaysAbsent++;
      totalWorkingHours += workingHours;
      totalProductiveHours += productiveHours;

      days.push({
        date: dateKey,
        dayName,
        dateFormatted,
        attendance,
        productiveHours: Math.max(0, productiveHours),
        salaryDeduction,
        isPresent,
        isAbsent,
        isLeave,
        isEditable: false,
      });
    }

    setDaysData(days);

    // Calculate summary
    const tax = parseFloat(taxInput) || 0;
    const totalSalaryAfterDeduction = salary - totalSalaryDeducted - tax;

    setSummary({
      totalSalaryDeducted,
      tax,
      totalSalary: salary,
      totalSalaryAfterDeduction,
      totalDaysPresent,
      totalDaysAbsent,
      totalWorkingHours,
      totalProductiveHours,
    });
  }, [attendanceData, selectedEmployee, selectedMonth, taxInput, leaveUpdateTrigger]);

  const handleEditField = (day: string, field: string) => {
    setEditingField({ day, field });
    const dayData = daysData.find(d => d.date === day);
    if (dayData) {
      if (field === 'checkIn') {
        const checkIn = dayData.attendance?.checkInTime 
          ? new Date(dayData.attendance.checkInTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          : '';
        // Set edited value
        setDaysData(prev => prev.map(d => 
          d.date === day ? { ...d, editedCheckIn: checkIn } : d
        ));
      } else if (field === 'checkOut') {
        const checkOut = dayData.attendance?.checkOutTime 
          ? new Date(dayData.attendance.checkOutTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          : '';
        setDaysData(prev => prev.map(d => 
          d.date === day ? { ...d, editedCheckOut: checkOut } : d
        ));
      } else if (field === 'breakTime') {
        setDaysData(prev => prev.map(d => 
          d.date === day ? { ...d, editedBreakTime: dayData.attendance?.totalBreakTime || 0 } : d
        ));
      }
    }
  };

  const handleSaveField = async (day: string, field: string, value: string | number) => {
    if (!selectedEmployee) return;

    // Validate input
    if (typeof value === 'string' && value.trim() === '') {
      setEditingField(null);
      return;
    }
    if (typeof value === 'number' && (isNaN(value) || value < 0)) {
      toast.error('Invalid value');
      setEditingField(null);
      return;
    }

    try {
      // Update attendance record via API
      const dayData = daysData.find(d => d.date === day);
      if (!dayData) return;

      const attendanceId = dayData.attendance?.id;
      if (!attendanceId) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(day)) {
          toast.error('Invalid date format');
          setEditingField(null);
          return;
        }

        // Create new attendance record
        const response = await fetch('/api/attendance/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedEmployee.id,
            date: day,
            checkInTime: field === 'checkIn' ? value : dayData.editedCheckIn || dayData.attendance?.checkInTime || '',
            checkOutTime: field === 'checkOut' ? value : dayData.editedCheckOut || dayData.attendance?.checkOutTime || '',
          }),
        });

        if (response.ok) {
          toast.success('Attendance record created');
          fetchAttendanceData();
        } else {
          const error = await response.json().catch(() => ({ message: 'Failed to create record' }));
          toast.error(error.message || 'Failed to create attendance record');
        }
      } else {
        // Update existing record - would need an update API endpoint
        toast.info('Update functionality requires API endpoint');
      }

      setEditingField(null);
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error('Failed to save field');
      setEditingField(null);
    }
  };

  const handleToggleLeave = (day: string) => {
    if (!selectedEmployee) return;

    const leaveKey = `${selectedEmployee.id}-${day}`;
    const currentValue = localStorage.getItem(leaveKey);
    const newValue = currentValue === 'true' ? 'false' : 'true';
    localStorage.setItem(leaveKey, newValue);
    
    // Trigger recalculation
    setLeaveUpdateTrigger(prev => prev + 1);
    toast.success(newValue === 'true' ? 'Marked as leave' : 'Removed leave mark');
  };

  const handleSaveTax = () => {
    const tax = parseFloat(taxInput);
    if (isNaN(tax) || tax < 0) {
      toast.error('Please enter a valid tax amount');
      return;
    }
    localStorage.setItem('employeeTax', taxInput);
    setSummary(prev => ({ ...prev, tax }));
    setShowTaxInput(false);
    toast.success('Tax saved');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "-";
    }
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Salary & Attendance Management
              </CardTitle>
              <p className="text-white/90 mt-1">Calculate salaries and manage attendance deductions</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Employee Selection */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <Users className="w-5 h-5 mr-2" />
            Select Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee?.id === employee.id
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.department} • {employee.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {employee.salary ? formatCurrency(employee.salary) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Monthly</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Month and Year Selection */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Month & Year
                </label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {selectedEmployee && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <TrendingUp className="w-5 h-5 mr-2" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Total Salary</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSalary)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Tax</div>
                <div className="flex items-center gap-2">
                  {showTaxInput ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        value={taxInput}
                        onChange={(e) => setTaxInput(e.target.value)}
                        className="flex-1"
                        placeholder="Enter tax"
                      />
                      <Button size="sm" onClick={handleSaveTax}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowTaxInput(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.tax)}</div>
                      <Button size="sm" variant="ghost" onClick={() => setShowTaxInput(true)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-sm text-gray-600">Salary Deducted</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSalaryDeducted)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">Net Salary</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalSalaryAfterDeduction)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Days Present</div>
                <div className="text-2xl font-bold text-green-600">{summary.totalDaysPresent}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Days Absent</div>
                <div className="text-2xl font-bold text-red-600">{summary.totalDaysAbsent}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Total Working Hours</div>
                <div className="text-2xl font-bold text-gray-900">{formatHours(summary.totalWorkingHours)}h</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Total Productive Hours</div>
                <div className="text-2xl font-bold text-blue-600">{formatHours(summary.totalProductiveHours)}h</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Table */}
      {selectedEmployee && (
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <Calendar className="w-5 h-5 mr-2" />
              Daily Attendance Details - {selectedEmployee.firstName} {selectedEmployee.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader size="lg" text="Loading attendance data..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Day</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Clock In</TableHead>
                      <TableHead className="font-semibold">Clock Out</TableHead>
                      <TableHead className="font-semibold">Break Time</TableHead>
                      <TableHead className="font-semibold">Productive Hours</TableHead>
                      <TableHead className="font-semibold">Salary Deduction</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daysData.map((day) => (
                      <TableRow key={day.date} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{day.dayName}</TableCell>
                        <TableCell>{day.dateFormatted}</TableCell>
                        <TableCell>
                          {editingField?.day === day.date && editingField?.field === 'checkIn' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                defaultValue={day.editedCheckIn || ''}
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    handleSaveField(day.date, 'checkIn', e.target.value);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{formatTime(day.attendance?.checkInTime || null)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditField(day.date, 'checkIn')}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingField?.day === day.date && editingField?.field === 'checkOut' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                defaultValue={day.editedCheckOut || ''}
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    handleSaveField(day.date, 'checkOut', e.target.value);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{formatTime(day.attendance?.checkOutTime || null)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditField(day.date, 'checkOut')}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingField?.day === day.date && editingField?.field === 'breakTime' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                defaultValue={day.editedBreakTime || 0}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  handleSaveField(day.date, 'breakTime', value);
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{day.attendance?.totalBreakTime ? `${(day.attendance.totalBreakTime / 60).toFixed(2)}h` : '-'}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditField(day.date, 'breakTime')}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{formatHours(day.productiveHours)}h</TableCell>
                        <TableCell className={day.salaryDeduction > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {formatCurrency(day.salaryDeduction)}
                        </TableCell>
                        <TableCell>
                          {day.isLeave ? (
                            <Badge className="bg-purple-100 text-purple-800">Leave</Badge>
                          ) : day.isPresent ? (
                            <Badge className="bg-green-100 text-green-800">Present</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Absent</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={day.isLeave ? "outline" : "ghost"}
                            onClick={() => handleToggleLeave(day.date)}
                            className={day.isLeave ? "text-purple-600" : ""}
                          >
                            {day.isLeave ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Remove Leave
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Mark Leave
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

