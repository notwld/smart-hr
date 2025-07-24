"use client"
import React, { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, X, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  status: string;
}

interface EmployeeCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    pfp: string | null;
  } | null;
}

export default function EmployeeCalendar({ isOpen, onClose, employee }: EmployeeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current month's first and last day
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfWeek = new Date(firstDayOfMonth);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  // Generate calendar days
  const calendarDays = [];
  const currentDay = new Date(startOfWeek);
  
  while (currentDay <= new Date(lastDayOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000)) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Fetch attendance data for the employee
  useEffect(() => {
    if (isOpen && employee) {
      fetchAttendanceData();
    }
  }, [isOpen, employee, currentDate]);

  const fetchAttendanceData = async () => {
    if (!employee) return;
    
    setLoading(true);
    try {
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = lastDayOfMonth.toISOString().split('T')[0];
      
      const response = await fetch(`/api/attendance/employee/${employee.id}?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.attendance || []);
      } else {
        console.error('Failed to fetch attendance data');
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return attendanceData.find(record => record.date === dateString);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'HALF_DAY': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={employee?.pfp || `/placeholder.svg?height=40&width=40&text=${employee?.firstName.charAt(0)}`}
                  alt={employee?.firstName}
                />
                <AvatarFallback>
                  {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">
                  {employee?.firstName} {employee?.lastName}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {employee?.position} • {employee?.department}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <h2 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const attendance = getAttendanceForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b p-2 ${
                      !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                    } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !isCurrentMonthDay ? 'text-gray-400' : 
                      isTodayDate ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>

                    {isCurrentMonthDay && attendance && (
                      <div className="space-y-1">
                        <div className="text-xs">
                          <div className="flex items-center gap-1 text-green-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(attendance.checkInTime)}
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(attendance.checkOutTime)}
                          </div>
                        </div>
                        
                        {attendance.totalHours && (
                          <div className="text-xs font-medium text-blue-600">
                            {attendance.totalHours.toFixed(1)}h
                          </div>
                        )}
                        
                        <Badge className={`text-xs ${getStatusColor(attendance.status)}`}>
                          {attendance.status}
                        </Badge>
                      </div>
                    )}

                    {isCurrentMonthDay && !attendance && (
                      <div className="text-xs text-gray-400 italic">
                        No data
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          {attendanceData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceData.filter(a => a.status === 'PRESENT').length}
                </div>
                <div className="text-sm text-gray-600">Present Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {attendanceData.filter(a => a.status === 'ABSENT').length}
                </div>
                <div className="text-sm text-gray-600">Absent Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceData.filter(a => a.status === 'LATE').length}
                </div>
                <div className="text-sm text-gray-600">Late Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceData.reduce((total, a) => total + (a.totalHours || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 