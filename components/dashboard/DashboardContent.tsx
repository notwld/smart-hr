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

            {/* Tasks Overview */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Tasks Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === "COMPLETED" ? "bg-green-500" :
                          task.status === "IN_PROGRESS" ? "bg-blue-500" :
                          "bg-yellow-500"
                        } mr-3`}></div>
                        <span>{task.title}</span>
                      </div>
                      <Badge
                        variant={
                          task.status === "COMPLETED"
                            ? "default"
                            : task.status === "IN_PROGRESS"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[150px]">
                  <ChartContainer
                    config={{
                      performance: {
                        label: "Performance",
                        color: "#3b82f6",
                      },
                    }}
                  >
                    <LineChart data={performanceData}>
                      <Line
                        type="monotone"
                        dataKey="performance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </LineChart>
                  </ChartContainer>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-2xl font-bold">
                    {user.performance[0]?.score || 0}%
                  </span>
                  {user.performance.length > 1 && (
                    <span className="ml-2 text-green-500 flex items-center text-sm">
                      <ChevronUp className="w-4 h-4" /> 
                      +{user.performance[0].score - user.performance[1].score}% vs last month
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-gray-500 text-xs">
                        Updated {new Date(skill.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 