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
  Ticket,
} from "lucide-react"
import { Line, LineChart, Pie, PieChart } from "recharts"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { User } from "@/lib/generated/prisma"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"
import { ButtonLoader, Loader } from "@/components/ui/loader"
import NotificationDropdown from "./NotificationDropdown"
import TicketRequestModal from "./TicketRequestModal"

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
  teams?: {
    team: {
      leader: {
        firstName: string;
        lastName: string;
      }
    }
  }[];
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

// Custom debounce implementation
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
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
  const [teamLeader, setTeamLeader] = useState<{ firstName: string; lastName: string } | null>(null);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<any[]>([]);

  // Function to generate time labels
  const generateTimeLabels = useCallback(() => {
    const labels: string[] = [];

    if (todayAttendance?.checkInTime) {
      // Start from check-in time
      const startTime = new Date(todayAttendance.checkInTime);
      // Round to nearest hour for cleaner display


      // Generate 10 labels (including start time and next 9 hours)
      for (let i = 0; i < 10; i++) {
        const time = new Date(startTime);
        time.setHours(startTime.getHours() + i);
        labels.push(format(time, 'hh:mm a'));
      }
    } else {
      // If no check-in, show default labels starting from current time
      const now = new Date();
      // Round to nearest hour
      now.setMinutes(0, 0, 0);

      // Generate 10 labels starting from current time
      for (let i = 0; i < 10; i++) {
        const time = new Date(now);
        time.setHours(now.getHours() + i);
        labels.push(format(time, 'hh:mm a'));
      }
    }

    setTimeLabels(labels);
  }, [todayAttendance?.checkInTime]);

  // Update the progress bar calculation to be dynamic based on check-in time
  const calculateProgress = useCallback(() => {
    if (!todayAttendance?.checkInTime) return 0;

    const now = new Date();
    const checkInTime = new Date(todayAttendance.checkInTime);
    const elapsedHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const progress = Math.min((elapsedHours / 9) * 100, 100); // 9 hours shift
    return progress;
  }, [todayAttendance?.checkInTime]);

  // Debounced fetch functions
  const debouncedFetchTodayAttendance = useCallback(
    debounce(async () => {
      try {
        const res = await axios.get("/api/attendance/today");
        setTodayAttendance(res.data);
      } catch (error) {
        console.error(error);
      }
    }, 1000),
    []
  );

  const debouncedFetchStats = useCallback(
    debounce(async () => {
      try {
        console.log("Fetching attendance stats...");
        const response = await axios.get("/api/attendance/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }, 5000),
    []
  );

  useEffect(() => {
    console.log("Dashboard useEffect triggered - setting up intervals");
    generateTimeLabels();
    debouncedFetchTodayAttendance();
    debouncedFetchStats();
    fetchAssignedTickets();

    // Set up interval to update time labels every minute
    const timeLabelInterval = setInterval(generateTimeLabels, 60000);

    // Set up interval to update stats every 5 minutes instead of every minute to reduce server load
    const statsInterval = setInterval(debouncedFetchStats, 300000);

    let elapsedInterval: NodeJS.Timeout;

    const updateElapsedTime = () => {
      if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
        const checkInTime = new Date(todayAttendance.checkInTime);
        const now = new Date();
        const diff = now.getTime() - checkInTime.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setElapsedTime(formattedTime);
      }
    };

    updateElapsedTime();

    if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
      elapsedInterval = setInterval(updateElapsedTime, 7000);
    }

    // If user doesn't have reportsTo but has a team, fetch team leader
    if (!user.reportsTo && (!user.teams || user.teams.length === 0)) {
      const fetchTeamLeader = async () => {
        try {
          const response = await axios.get(`/api/users/${user.id}/team-leader`);
          if (response.data && response.data.leader) {
            setTeamLeader(response.data.leader);
          }
        } catch (error) {
          console.error("Error fetching team leader:", error);
        }
      };

      fetchTeamLeader();
    } else if (user.teams && user.teams.length > 0 && user.teams[0].team.leader) {
      setTeamLeader(user.teams[0].team.leader);
    }

    return () => {
      console.log("Dashboard useEffect cleanup - clearing intervals");
      clearInterval(timeLabelInterval);
      clearInterval(statsInterval);
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
      }
    };
  }, [todayAttendance?.checkInTime, user.id, user.reportsTo, user.teams]);

  // Replace the fetchTodayAttendance and fetchStats functions with their debounced versions
  const fetchTodayAttendance = () => debouncedFetchTodayAttendance();
  const fetchStats = () => debouncedFetchStats();

  // Function to fetch tickets assigned to current user
  const fetchAssignedTickets = useCallback(async () => {
    try {
      console.log('Fetching assigned tickets for dashboard...');
      const response = await axios.get('/api/tickets?assignedTo=current&limit=5');
      console.log('Assigned tickets response:', response.data);
      setAssignedTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
    }
  }, []);

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
        {/* Assigned Tickets Card */}
        {assignedTickets.length > 0 && (
          <div className="col-span-3 mt-6">
            <Card className="border-0 rounded-lg shadow-sm bg-[#fff7ed]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  Tickets Assigned to Me
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AssignedTicketsTable tickets={assignedTickets} />
              </CardContent>
            </Card>
          </div>
        )}
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          {/* Notification Banner */}
          {user.leaves.some(l => l.status === "APPROVED" && new Date(l.startDate) > new Date()) && (
            <div className="bg-primary text-white px-4 py-2 text-sm flex items-center">
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

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <TicketRequestModal />
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employee Profile Card */}
            <Card className="overflow-hidden rounded-lg shadow-sm border-0">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-cyan-600 text-lg font-bold shadow-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-white/90">{user.position} - {user.department}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 bg-[#dff9ff]">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-gray-500 mt-1 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{user.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 text-gray-500 mt-1 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-gray-500 mt-1 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Report To</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.reportsTo
                          ? `${user.reportsTo.firstName} ${user.reportsTo.lastName}`
                          : teamLeader
                            ? `${teamLeader.firstName} ${teamLeader.lastName} (Team Leader)`
                            : "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Layout className="w-4 h-4 text-gray-500 mt-1 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-900">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-gray-500 mt-1 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Join Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(user.joinDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Details Pie Chart Card */}
            <Card className="border-0 rounded-lg shadow-sm  bg-[#dff9ff]">
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">Leave Details</CardTitle>
                <Button variant="outline" size="sm" className="h-8 px-4 rounded-full border-cyan-200 bg-white hover:bg-cyan-50">
                  <span className="text-cyan-600 font-medium">{new Date().getFullYear()}</span>
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
            <Card className="bg-[#dff9ff] border-0 rounded-lg shadow-sm ">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Leave Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Leaves</p>
                    <p className="text-2xl font-bold text-gray-900">{leaveStats.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Taken</p>
                    <p className="text-2xl font-bold text-gray-900">{leaveStats.taken}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{leaveStats.pending}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{20 - leaveStats.taken}</p>
                  </div>
                </div>
                <div className="align-self-end">
                  <Link href="/leaves/apply">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                      Leave Summary
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>


          


            {/* Attendance and Work Hours Side by Side */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Attendance Card */}
              <Card className="md:col-span-1 border-0 rounded-lg shadow-sm bg-[#dff9ff]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">Attendance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-40 h-40 rounded-full border-8 border-[#dff9ff] flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-t-8 border-primary"></div>
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
                       className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                       onClick={handleCheckIn}
                       disabled={loading}
                     >
                       {loading ? <ButtonLoader size="sm" /> : "Punch In"}
                     </Button>
                  )}

                  {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={handleCheckOut}
                      disabled={loading}
                    >
                      {loading ? <ButtonLoader size="sm" /> : "Punch Out"}
                    </Button>
                  )}

                  {todayAttendance?.checkInTime && todayAttendance?.checkOutTime && (
                    <div className="text-green-600 font-semibold mt-2">Attendance Completed ✔️</div>
                  )}
                </CardContent>
              </Card>


              {/* Work Hours Tracker Card */}
              <Card className="md:col-span-3 border-0 rounded-lg shadow-sm bg-[#dff9ff]">
                <CardContent className="p-6">
                  {/* Attendance and Work Hours Row */}
                  <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Hours Tracking Cards */}
                    <Card className="bg-white border-0 rounded-lg shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
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
                    <Card className="bg-white border-0 rounded-lg shadow-sm">
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
                    <Card className="bg-white border-0 rounded-lg shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                            <Clock className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">{stats?.month?.total.toFixed(2)}</span>
                          <span className="text-gray-500 ml-1">/ 180</span>
                        </div>
                        <p className="text-sm text-gray-600">Total Hours Month</p>
                        <div className="mt-3 flex items-center">
                          <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-white text-xs">
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
                    <Card className="bg-white border-0 rounded-lg shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white">
                            <Clock className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">{stats?.month?.overtime.toFixed(2)}</span>
                          <span className="text-gray-500 ml-1">/ 28</span>
                        </div>
                        <p className="text-sm text-gray-600">Overtime this Month</p>
                        <div className="mt-3 flex items-center">
                          <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-white text-xs">
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
                        <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
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
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-white font-medium">
                      {calculateProgress().toFixed(1)}% Complete
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {timeLabels.map((label, index) => (
                      <span key={index}>{label}</span>
                    ))}
                  </div>

                </CardContent>
              </Card>
            </div>


          </div>

          {/* Attendance History and Leave History Cards */}
          <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Attendance History Card */}
            <Card className="border-0 rounded-lg shadow-sm bg-[#dff9ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">Attendance History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceHistoryTable />
              </CardContent>
            </Card>

            {/* Leave History Card */}
            <Card className="border-0 rounded-lg shadow-sm bg-[#dff9ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">Leave History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LeaveHistoryTable />
              </CardContent>
            </Card>
          </div>
            {/* My Tickets Card */}
            <Card className="mt-5 border-0 rounded-lg shadow-sm bg-[#fff7ed]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-orange-500" />
                  My Support Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MyTicketsTable />
              </CardContent>
            </Card>
        </main>
      </div>
    </div>
  )
}

// Assigned Tickets Table Component
function AssignedTicketsTable({ tickets }: { tickets: any[] }) {
  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    };
    return styles[priority as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-orange-50">
            <th className="px-3 py-2 text-left font-medium text-gray-500">Ticket</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Priority</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Due Date</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center">
                <div className="flex flex-col items-center">
                  <User className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No tickets assigned to you</p>
                </div>
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-orange-25">
                <td className="px-3 py-2">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{ticket.ticketNumber}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.title}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge className={`text-xs ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {ticket.dueDate ? formatDate(ticket.dueDate) : 'No due date'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open ticket in a new tab/window
                        window.open(`/tickets/${ticket.id}`, '_blank');
                      }}
                      className="h-8 w-auto px-3 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {tickets.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <Link href="/tickets?assignedTo=current" className="text-sm text-orange-600 hover:text-orange-800">
            View all assigned tickets →
          </Link>
        </div>
      )}
    </div>
  );
}

// My Tickets Table Component
function MyTicketsTable() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await axios.get('/api/tickets?limit=5&createdBy=current');
        setTickets(response.data.tickets || []);
      } catch (error) {
        console.error('Error fetching my tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    };
    return styles[priority as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-orange-50">
            <th className="px-3 py-2 text-left font-medium text-gray-500">Ticket</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Priority</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center">
                <Loader size="sm" text="Loading tickets..." />
              </td>
            </tr>
          ) : tickets.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center">
                <div className="flex flex-col items-center">
                  <Ticket className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No tickets submitted yet</p>
                  <p className="text-gray-400 text-xs">Use the "Submit Ticket" button to create one</p>
                </div>
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-orange-25">
                <td className="px-3 py-2">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{ticket.ticketNumber}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.title}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge className={`text-xs ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {formatDate(ticket.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {tickets.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <Link href="/tickets" className="text-sm text-orange-600 hover:text-orange-800">
            View all my tickets →
          </Link>
        </div>
      )}
    </div>
  );
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
              <td colSpan={5} className="px-4 py-8 text-center">
                <Loader size="md" text="Loading attendance history..." />
              </td>
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
              <td colSpan={5} className="px-4 py-8 text-center">
                <Loader size="md" text="Loading leave history..." />
              </td>
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