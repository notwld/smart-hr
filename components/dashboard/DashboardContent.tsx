"use client"

import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  Layout,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  MoreVertical,
  Phone,
  Settings,
  Sun,
  Users,
  X,
  ChevronUp,
} from "lucide-react"
import { Line, LineChart, Pie, PieChart } from "recharts"
import {format} from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { User } from "@/lib/generated/prisma"
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"

interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  joinDate: string;
  reportsTo?: {
    firstName: string;
    lastName: string;
  };
  // ... other fields
}

interface DashboardContentProps {
  user: DashboardUser & {
    attendance: any[];
    leaves: any[];
    tasks: any[];
    skills: any[];
    performance: any[];
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  // Calculate attendance statistics
  const attendanceStats = {
    onTime: user.attendance.filter(a => a.status === "PRESENT").length,
    late: user.attendance.filter(a => a.status === "LATE").length,
    workFromHome: user.attendance.filter(a => a.status === "WORK_FROM_HOME").length,
    absent: user.attendance.filter(a => a.status === "ABSENT").length,
    sickLeave: user.leaves.filter(l => l.type === "SICK" && l.status === "APPROVED").length,
  }

  // Calculate leave statistics
  const leaveStats = {
    total: user.leaves.length,
    taken: user.leaves.filter(l => l.status === "APPROVED").length,
    pending: user.leaves.filter(l => l.status === "PENDING").length,
  }

  // Format performance data for chart
  const performanceData = user.performance.map(p => ({
    month: new Date(2000, p.month - 1).toLocaleString('default', { month: 'short' }),
    performance: p.score
  }))

  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [showLeaveBanner, setShowLeaveBanner] = useState(true);

  useEffect(() => {
    fetchTodayAttendance();
    fetchStats();
    // Set up interval to update stats every minute
    const interval = setInterval(fetchStats, 60000);

    let elapsedInterval: NodeJS.Timeout;

    const updateElapsedTime = () => {
      if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
        const checkInTime = new Date(todayAttendance.checkInTime);
        const now = new Date();
        const diff = now.getTime() - checkInTime.getTime();
        
        // Calculate hours, minutes, seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format time as HH:MM:SS
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setElapsedTime(formattedTime);
      }
    };

    // Initial update
    updateElapsedTime();

    // Set up interval for updates
    if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
      elapsedInterval = setInterval(updateElapsedTime, 1000);
    }

    return () => {
      clearInterval(interval);
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
      }
    };
  }, [todayAttendance]);
 
  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get("/api/attendance/today");
      setTodayAttendance(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/attendance/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/attendance/checkin");
      if (response.status === 200) {
        await fetchTodayAttendance();
        toast.success("Successfully checked in!");
      }
    } catch (error: any) {
      console.error("Check-in error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to check in. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/attendance/checkout");
      if (response.status === 200) {
        await fetchTodayAttendance();
        toast.success("Successfully checked out!");
      }
    } catch (error: any) {
      console.error("Check-out error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to check out. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format total hours
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor((((hours - h) * 60) - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };


  return (
    <div className="flex w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          {/* Notification Banner */}
          {user.leaves.some(l => l.status === "APPROVED" && new Date(l.startDate) > new Date()) && (
            <div className="bg-[#FF7B3D] text-white px-4 py-2 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Your Leave Request has been Approved!</span>
              <button className="ml-auto">
                <X className="w-4 h-4" onClick={() => setShowLeaveBanner(false)} />
              </button>
            </div>
          )}

          {/* Header Content */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <button className="md:hidden mr-2">
                <Menu className="w-6 h-6" />
              </button>
              <div className="text-sm breadcrumbs">
                <ul className="flex items-center space-x-2">
                  <li>
                    <a href="#" className="text-gray-500">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <span className="text-gray-400 mx-1">/</span>
                  </li>
                  <li>
                    <span className="font-medium">Employee Dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Print</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employee Profile Card */}
            <Card className="overflow-hidden">
              <div className="bg-[#FF7B3D] text-white p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {user.firstName[0]} {user.lastName[0]}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-white">{user.position} - {user.department}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-sm font-medium">{user.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Report To</p>
                      <p className="text-sm font-medium">
                        {user.reportsTo ? `${user.reportsTo.firstName} ${user.reportsTo.lastName}` : "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Layout className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-sm font-medium">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="text-sm font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Details Pie Chart Card */}
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle className="text-base">Leave Details</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3">
                  <span className="text-blue-600 font-medium">{new Date().getFullYear()}</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex">
                  <div className="space-y-2 pr-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-teal-700 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">{attendanceStats.onTime}</span> on time
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">{attendanceStats.late}</span> Late Attendance
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">{attendanceStats.workFromHome}</span> Work From Home
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">{attendanceStats.absent}</span> Absent
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">{attendanceStats.sickLeave}</span> Sick Leave
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-[180px]">
                      <ChartContainer
                        config={{
                          onTime: {
                            label: "On Time",
                            color: "#115e59",
                          },
                          lateAttendance: {
                            label: "Late Attendance",
                            color: "#22c55e",
                          },
                          workFromHome: {
                            label: "Work From Home",
                            color: "#f97316",
                          },
                          absent: {
                            label: "Absent",
                            color: "#ef4444",
                          },
                          sickLeave: {
                            label: "Sick Leave",
                            color: "#facc15",
                          },
                        }}
                      >
                        <PieChart>
                          <Pie
                            data={[
                              { name: "On Time", value: attendanceStats.onTime, fill: "#115e59" },
                              { name: "Late Attendance", value: attendanceStats.late, fill: "#22c55e" },
                              { name: "Work From Home", value: attendanceStats.workFromHome, fill: "#f97316" },
                              { name: "Absent", value: attendanceStats.absent, fill: "#ef4444" },
                              { name: "Sick Leave", value: attendanceStats.sickLeave, fill: "#facc15" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Summary Card */}
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle className="text-base">Leave Summary</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3">
                  <span className="text-blue-600 font-medium">{new Date().getFullYear()}</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm">Total Leaves</p>
                    <p className="text-xl font-medium">{leaveStats.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Taken</p>
                    <p className="text-xl font-medium">{leaveStats.taken}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-xl font-medium">{leaveStats.pending}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Available</p>
                    <p className="text-xl font-medium">{20 - leaveStats.taken}</p>
                  </div>
                </div>
                <Link href="/leaves/apply">
                  <Button className="w-full bg-gray-900 hover:bg-black text-white">
                    Apply for Leave
                  </Button>
                </Link>
              </CardContent>
            </Card>
        
           
            {/* Attendance and Work Hours Side by Side */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Attendance Card */}
              <Card className="md:col-span-1">
    <CardHeader>
      <CardTitle className="text-base">Attendance</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center">
      <div className="relative w-40 h-40 rounded-full border-8 border-gray-100 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-t-8 border-orange-500"></div>
        <div className="text-center">
          <p className="text-xl font-bold">
            {todayAttendance?.checkInTime
              ? format(new Date(todayAttendance.checkInTime), "hh:mm a")
              : "--:--"}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(), "dd MMM yyyy")}
          </p>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">Time Elapsed</p>
        <p className="text-xl font-bold">{elapsedTime}</p>
      </div>

      {/* <div className="text-center mb-4">
        <p className="text-sm text-gray-500">Total Hours Today</p>
        <p className="text-xl font-bold">
          {todayAttendance?.totalHours
            ? formatHours(todayAttendance.totalHours)
            : "0h 0m 0s"}
        </p>
      </div> */}

      {!todayAttendance?.checkInTime && (
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={handleCheckIn}
          disabled={loading}
        >
          {loading ? "Checking In..." : "Punch In"}
        </Button>
      )}

      {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading ? "Checking Out..." : "Punch Out"}
        </Button>
      )}

      {todayAttendance?.checkInTime && todayAttendance?.checkOutTime && (
        <div className="text-green-600 font-semibold mt-2">Attendance Completed ✔️</div>
      )}
    </CardContent>
  </Card>


              {/* Work Hours Tracker Card */}
              <Card className="md:col-span-3">
                <CardContent className="p-4">
                   {/* Attendance and Work Hours Row */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Hours Tracking Cards */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats?.today?.total.toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/ 9</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Today</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      <ChevronUp className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">5% This Week</span>
                  </div>
                  {stats?.today?.remaining > 0 && (
                    <div className="mt-2 text-sm text-orange-500">
                      Remaining: {formatHours(stats.today.remaining)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Hours Week */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-md bg-gray-900 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats?.week?.total.toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/ 45</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Week</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      <ChevronUp className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">7% Last Week</span>
                  </div>
                  {stats?.week?.remaining > 0 && (
                    <div className="mt-2 text-sm text-orange-500">
                      Remaining: {formatHours(stats.week.remaining)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Hours Month */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats?.month?.total.toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/ 180</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Month</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">8% Last Month</span>
                  </div>
                  {stats?.month?.remaining > 0 && (
                    <div className="mt-2 text-sm text-orange-500">
                      Remaining: {formatHours(stats.month.remaining)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Overtime this Month */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-md bg-pink-500 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats?.month?.overtime.toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/ 28</span>
                  </div>
                  <p className="text-sm text-gray-600">Overtime this Month</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">6% Last Month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

                  <div className="grid grid-cols-5 gap-6 mb-4">
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <span className="text-sm text-gray-600">Total Working hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">{formatHours(stats?.today?.total || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Productive Hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">{formatHours(stats?.today?.productive || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                        <span className="text-sm text-gray-600">Break hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">{formatHours(stats?.today?.break || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Overtime</span>
                      </div>
                      <p className="text-xl font-medium mt-1">{formatHours(stats?.today?.overtime || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Remaining Hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">{formatHours(stats?.today?.remaining || 0)}</p>
                    </div>
                  </div>

                  <div className="relative h-8 w-full mt-6 mb-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-l-md transition-all duration-1000"
                      style={{ width: `${stats?.today?.progress || 0}%` }}
                    ></div>
                    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-white font-medium">
                      {stats?.today?.progress.toFixed(1)}% Complete
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>06:00 PM</span>
                    <span>07:00 PM</span>
                    <span>08:00 PM</span>
                    <span>09:00 PM</span>
                    <span>10:00 PM</span>
                    <span>11:00 PM</span>
                    <span>12:00 AM</span>
                    <span>01:00 AM</span>
                    <span>02:00 AM</span>
                    <span>03:00 AM</span>
                  </div>
                  
                </CardContent>
              </Card>
            </div>

           
          </div>

          {/* Attendance History and Leave History Cards */}
          <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Attendance History Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Attendance History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceHistoryTable />
              </CardContent>
            </Card>

            {/* Leave History Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Leave History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LeaveHistoryTable />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 

// Attendance History Table Component
function AttendanceHistoryTable() {
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        const response = await axios.get('/api/attendance/history?limit=5');
        setAttendanceHistory(response.data);
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        toast.error('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, []);

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'WORK_FROM_HOME': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Function to format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return format(new Date(timeString), 'hh:mm a');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Clock In</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Clock Out</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Hours</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center">Loading...</td>
            </tr>
          ) : attendanceHistory.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center">No attendance records found</td>
            </tr>
          ) : (
            attendanceHistory.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{formatDate(record.date)}</td>
                <td className="px-4 py-3">{formatTime(record.checkInTime)}</td>
                <td className="px-4 py-3">{formatTime(record.checkOutTime)}</td>
                <td className="px-4 py-3">{record.totalHours ? record.totalHours.toFixed(2) : '--'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-4 border-t border-gray-200 text-center">
        <Link href="/attendance" className="text-sm text-blue-600 hover:text-blue-800">
          View All Attendance Records →
        </Link>
      </div>
    </div>
  );
}

// Leave History Table Component
function LeaveHistoryTable() {
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const response = await axios.get('/api/leaves/history?limit=5');
        setLeaveHistory(response.data);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        toast.error('Failed to load leave history');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveHistory();
  }, []);

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get leave type badge color
  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'SICK': return 'bg-purple-100 text-purple-800';
      case 'VACATION': return 'bg-blue-100 text-blue-800';
      case 'PERSONAL': return 'bg-indigo-100 text-indigo-800';
      case 'MATERNITY': return 'bg-pink-100 text-pink-800';
      case 'PATERNITY': return 'bg-cyan-100 text-cyan-800';
      case 'UNPAID': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Function to calculate leave duration in days
  const getLeaveDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + (diffDays === 1 ? ' day' : ' days');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">From</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">To</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center">Loading...</td>
            </tr>
          ) : leaveHistory.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center">No leave records found</td>
            </tr>
          ) : (
            leaveHistory.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getLeaveTypeColor(record.type)}`}>
                    {record.type}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(record.startDate)}</td>
                <td className="px-4 py-3">{formatDate(record.endDate)}</td>
                <td className="px-4 py-3">{getLeaveDuration(record.startDate, record.endDate)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-4 border-t border-gray-200 text-center">
        <Link href="/leaves" className="text-sm text-blue-600 hover:text-blue-800">
          View All Leave Records →
        </Link>
      </div>
    </div>
  );
} 