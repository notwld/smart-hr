"use client"
import React, { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, X, Clock, User, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { EmployeeLiveStats } from "@/components/dashboard/cards/EmployeeLiveStats"

interface BreakRecord {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
  status: string;
  breaks?: BreakRecord[];
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayStats, setShowDayStats] = useState(false);

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

  // Calculate stats and timeline for a specific date
  const calculateDayStats = (attendance: AttendanceRecord) => {
    if (!attendance.checkInTime) return null;

    const checkInTime = new Date(attendance.checkInTime);
    const now = new Date();
    // Use checkout time if available, otherwise use now (for current day)
    const endTime = attendance.checkOutTime ? new Date(attendance.checkOutTime) : now;
    
    // Total working hours (in hours)
    const totalWorkingMs = endTime.getTime() - checkInTime.getTime();
    const totalWorkingHours = totalWorkingMs / (1000 * 60 * 60);

    // Calculate break time from all breaks
    const breaks = attendance.breaks || [];
    const completedBreaks = breaks.filter(b => b.endTime !== null);
    const activeBreak = breaks.find(b => b.endTime === null);
    
    // Total break time in hours
    const totalBreakMinutes = completedBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);
    // For active breaks on past dates, use checkout time or now (whichever is earlier)
    const activeBreakEndTime = activeBreak 
      ? (attendance.checkOutTime ? new Date(attendance.checkOutTime) : now)
      : null;
    const currentBreakMinutes = activeBreak && activeBreakEndTime
      ? (activeBreakEndTime.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60)
      : 0
    const totalBreakHours = (totalBreakMinutes + currentBreakMinutes) / 60

    // Productive hours = Total Working - Break Hours
    const productiveHours = Math.max(0, totalWorkingHours - totalBreakHours)

    // Overtime (hours beyond standard work hours, excluding breaks)
    const standardWorkHours = 8;
    const overtimeHours = Math.max(0, productiveHours - standardWorkHours)
    
    // Adjust productive hours to exclude overtime
    const adjustedProductiveHours = Math.min(productiveHours, standardWorkHours)

    // Create timeline segments
    const timelineSegments: Array<{
      type: 'productive' | 'break' | 'overtime'
      startTime: Date
      endTime: Date | null
      duration: number
    }> = []

    let currentTime = checkInTime
    
    // Process all breaks (completed and active)
    const allBreaks = [...completedBreaks]
    if (activeBreak) {
      allBreaks.push({
        ...activeBreak,
        endTime: null,
        duration: currentBreakMinutes / 60
      } as any)
    }
    allBreaks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    for (const breakRecord of allBreaks) {
      const breakStart = new Date(breakRecord.startTime)
      // For active breaks, use checkout time if available, otherwise use now
      const breakEnd = breakRecord.endTime 
        ? new Date(breakRecord.endTime) 
        : (attendance.checkOutTime ? new Date(attendance.checkOutTime) : now)

      // Add productive segment before break
      if (currentTime < breakStart) {
        const productiveDuration = (breakStart.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
        timelineSegments.push({
          type: 'productive',
          startTime: currentTime,
          endTime: breakStart,
          duration: productiveDuration
        })
      }

      // Add break segment
      const breakDuration = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60)
      timelineSegments.push({
        type: 'break',
        startTime: breakStart,
        endTime: breakEnd,
        duration: breakDuration
      })

      currentTime = breakEnd
    }

    // Add remaining segment (productive or overtime)
    if (currentTime < endTime) {
      const remainingDuration = (endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
      if (remainingDuration > 0) {
        const standardWorkEndTime = new Date(checkInTime)
        standardWorkEndTime.setHours(standardWorkEndTime.getHours() + standardWorkHours)
        
        if (currentTime >= standardWorkEndTime) {
          // All remaining time is overtime
          timelineSegments.push({
            type: 'overtime',
            startTime: currentTime,
            endTime: endTime,
            duration: remainingDuration
          })
        } else if (endTime <= standardWorkEndTime) {
          // All remaining time is productive
          timelineSegments.push({
            type: 'productive',
            startTime: currentTime,
            endTime: endTime,
            duration: remainingDuration
          })
        } else {
          // Split: some productive, some overtime
          const productiveDuration = (standardWorkEndTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
          const overtimeDuration = (endTime.getTime() - standardWorkEndTime.getTime()) / (1000 * 60 * 60)
          
          if (productiveDuration > 0) {
            timelineSegments.push({
              type: 'productive',
              startTime: currentTime,
              endTime: standardWorkEndTime,
              duration: productiveDuration
            })
          }
          
          if (overtimeDuration > 0) {
            timelineSegments.push({
              type: 'overtime',
              startTime: standardWorkEndTime,
              endTime: endTime,
              duration: overtimeDuration
            })
          }
        }
      }
    }

    return {
      stats: {
        totalWorkingHours: totalWorkingHours,
        productiveHours: adjustedProductiveHours,
        breakHours: totalBreakHours,
        overtimeHours: overtimeHours
      },
      timelineSegments: timelineSegments.map(segment => ({
        ...segment,
        startTime: segment.startTime.toISOString(),
        endTime: segment.endTime?.toISOString() || null
      })),
      breaks: breaks,
      activeBreak: activeBreak || null
    }
  };

  const handleDayClick = (date: Date) => {
    const attendance = getAttendanceForDate(date);
    if (attendance && attendance.checkInTime) {
      setSelectedDate(date);
      setShowDayStats(true);
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
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {employee?.firstName} {employee?.lastName}
                </DialogTitle>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <User className="h-4 w-4" />
                  {employee?.position} • {employee?.department}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                <Calendar className="w-4 h-4 mr-1" />
                Monthly View
              </Badge>
            
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Month Navigation */}
          <Card className="border-0 shadow-sm bg-[#dff9ff]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="border-cyan-200 hover:bg-cyan-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <h2 className="text-xl font-bold text-cyan-700 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="border-cyan-200 hover:bg-cyan-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
               {/* Summary Stats */}
          {attendanceData.length > 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Monthly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {attendanceData.filter(a => a.status === 'PRESENT').length}
                    </div>
                    <div className="text-sm font-medium text-green-700">Present Days</div>
                    <div className="text-xs text-green-600 mt-1">
                      {((attendanceData.filter(a => a.status === 'PRESENT').length / attendanceData.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {attendanceData.filter(a => a.status === 'ABSENT').length}
                    </div>
                    <div className="text-sm font-medium text-red-700">Absent Days</div>
                    <div className="text-xs text-red-600 mt-1">
                      {((attendanceData.filter(a => a.status === 'ABSENT').length / attendanceData.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {attendanceData.filter(a => a.status === 'LATE').length}
                    </div>
                    <div className="text-sm font-medium text-yellow-700">Late Days</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {((attendanceData.filter(a => a.status === 'LATE').length / attendanceData.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {attendanceData.reduce((total, a) => total + (a.totalHours || 0), 0).toFixed(1)}/{attendanceData.length}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Total Hours</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Avg: {(attendanceData.reduce((total, a) => total + (a.totalHours || 0), 0) / attendanceData.filter(a => a.totalHours).length).toFixed(1)}h/day
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

              <div className="mt-5 border rounded-lg overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  {dayNames.map(day => (
                    <div key={day} className="p-4 text-center text-sm font-semibold text-gray-700">
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
                        onClick={() => isCurrentMonthDay && attendance && attendance.checkInTime && handleDayClick(date)}
                        className={`min-h-[130px] border-r border-b p-3 transition-colors ${
                          !isCurrentMonthDay ? 'bg-gray-50/50' : 'bg-white'
                        } ${isTodayDate ? 'ring-2 ring-cyan-500 bg-cyan-50' : ''} ${
                          isCurrentMonthDay && attendance && attendance.checkInTime 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : ''
                        }`}
                      >
                        <div className={`text-sm font-bold mb-2 ${
                          !isCurrentMonthDay ? 'text-gray-400' : 
                          isTodayDate ? 'text-cyan-600' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>

                        {isCurrentMonthDay && attendance && (
                          <div className="space-y-2">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">In: {formatTime(attendance.checkInTime)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Out: {formatTime(attendance.checkOutTime)}</span>
                              </div>
                            </div>
                            
                            {attendance.totalHours && (
                              <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-center">
                                {attendance.totalHours.toFixed(1)}h
                              </div>
                            )}
                            
                            <Badge className={`text-xs w-full justify-center ${getStatusColor(attendance.status)}`}>
                              {attendance.status}
                            </Badge>
                          </div>
                        )}

                        {isCurrentMonthDay && !attendance && (
                          <div className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded text-center">
                            No record
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

         
          {loading && (
            <div className="flex items-center justify-center p-12">
              <Loader size="lg" text="Loading attendance data..." />
            </div>
          )}
        </div>
      </DialogContent>

      {/* Day Stats Dialog */}
      <Dialog open={showDayStats} onOpenChange={setShowDayStats}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-bold text-white">
              {selectedDate && employee && (
                <>
                  {employee.firstName} {employee.lastName} - {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && employee && (() => {
            const attendance = getAttendanceForDate(selectedDate);
            if (!attendance || !attendance.checkInTime) {
              return (
                <div className="text-center py-8 text-gray-500">
                  No attendance record for this date
                </div>
              );
            }
            const dayStats = calculateDayStats(attendance);
            if (!dayStats) {
              return (
                <div className="text-center py-8 text-gray-500">
                  Unable to calculate stats for this date
                </div>
              );
            }
            return (
              <EmployeeLiveStats
                attendanceId={attendance.id}
                user={{
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  position: employee.position,
                  department: employee.department,
                  email: employee.email,
                  pfp: employee.pfp
                }}
                checkInTime={attendance.checkInTime}
                checkOutTime={attendance.checkOutTime}
                stats={dayStats.stats}
                timelineSegments={dayStats.timelineSegments}
                activeBreak={dayStats.activeBreak}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 