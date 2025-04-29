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

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { User } from "@/lib/generated/prisma"

interface DashboardContentProps {
  user: User & {
    attendance: any[]
    leaves: any[]
    tasks: any[]
    skills: any[]
    performance: any[]
  }
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

  return (
    <div className="flex w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          {/* Notification Banner */}
          {user.leaves.some(l => l.status === "APPROVED" && new Date(l.startDate) > new Date()) && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Your Leave Request has been Approved!</span>
              <button className="ml-auto">
                <X className="w-4 h-4" />
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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employee Profile Card */}
            <Card className="overflow-hidden">
              <div className="bg-blue-900 text-white p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {user.firstName[0]} {user.lastName[0]}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-blue-200">{user.position} - {user.department}</p>
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
                      <p className="text-sm font-medium">{user.reportsTo?.name || "Not assigned"}</p>
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
                <Button className="w-full bg-gray-900 hover:bg-black text-white">Apply New Leave</Button>
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
                      <p className="text-xl font-bold">08:35 AM</p>
                      <p className="text-xs text-gray-500">11 Mar 2025</p>
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">Total Hours Today</p>
                    <p className="text-xl font-bold">5:48:32</p>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Punch Out</Button>
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
                    <span className="text-2xl font-bold">8.36</span>
                    <span className="text-gray-500 ml-1">/ 9</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Today</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      <ChevronUp className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">5% This Week</span>
                  </div>
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
                    <span className="text-2xl font-bold">10</span>
                    <span className="text-gray-500 ml-1">/ 40</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Week</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      <ChevronUp className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">7% Last Week</span>
                  </div>
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
                    <span className="text-2xl font-bold">75</span>
                    <span className="text-gray-500 ml-1">/ 98</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Hours Month</p>
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <span className="text-sm ml-1">8% Last Month</span>
                  </div>
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
                    <span className="text-2xl font-bold">16</span>
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

                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <span className="text-sm text-gray-600">Total Working hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">12h 36m</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Productive Hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">08h 36m</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                        <span className="text-sm text-gray-600">Break hours</span>
                      </div>
                      <p className="text-xl font-medium mt-1">22m 15s</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Overtime</span>
                      </div>
                      <p className="text-xl font-medium mt-1">02h 15m</p>
                    </div>
                  </div>

                  <div className="relative h-8 w-full mt-6 mb-2">
                    <div className="absolute top-0 left-[6%] h-full w-[14%] bg-green-500 rounded-l-md"></div>
                    <div className="absolute top-0 left-[20%] h-full w-[5%] bg-yellow-400"></div>
                    <div className="absolute top-0 left-[25%] h-full w-[20%] bg-green-500"></div>
                    <div className="absolute top-0 left-[45%] h-full w-[15%] bg-yellow-400"></div>
                    <div className="absolute top-0 left-[60%] h-full w-[20%] bg-green-500"></div>
                    <div className="absolute top-0 left-[80%] h-full w-[5%] bg-yellow-400"></div>
                    <div className="absolute top-0 left-[85%] h-full w-[10%] bg-blue-500 rounded-r-md"></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>06:00</span>
                    <span>07:00</span>
                    <span>08:00</span>
                    <span>09:00</span>
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                    <span>01:00</span>
                    <span>02:00</span>
                    <span>03:00</span>
                    <span>04:00</span>
                    <span>05:00</span>
                    <span>06:00</span>
                    <span>07:00</span>
                    <span>08:00</span>
                    <span>09:00</span>
                    <span>10:00</span>
                    <span>11:00</span>
                  </div>
                  
                </CardContent>
              </Card>
            </div>

           
          </div>
        </main>
      </div>
    </div>
  )
} 