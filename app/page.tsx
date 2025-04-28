"use client"

import { useState } from "react"
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

export default function EmployeeDashboard() {


  return (
    <div className="flex w-full">


      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          {/* Notification Banner */}
          <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Your Leave Request on 27th April 2023 has been Approved!</span>
            <button className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>

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
            {/* Row 1: Profile, Leave Details, Leave Summary */}

            {/* Employee Profile Card */}
            <Card className="overflow-hidden">
              <div className="bg-blue-900 text-white p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    SP
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Stephan Peart</h3>
                    <p className="text-sm text-blue-200">Senior Product Designer - UI/UX Design</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-sm font-medium">+1 234 2435 345</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">stephan674@example.com</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Report To</p>
                      <p className="text-sm font-medium">Douglas Martin</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Layout className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-sm font-medium">UI Design</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="text-sm font-medium">15 Jan 2024</p>
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
                  <span className="text-blue-600 font-medium">2024</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex">
                  <div className="space-y-2 pr-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-teal-700 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">1254</span> on time
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">32</span> Late Attendance
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">658</span> Work From Home
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">14</span> Absent
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                      <span className="text-sm">
                        <span className="font-medium">68</span> Sick Leave
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
                              { name: "On Time", value: 1254, fill: "#115e59" },
                              { name: "Late Attendance", value: 32, fill: "#22c55e" },
                              { name: "Work From Home", value: 658, fill: "#f97316" },
                              { name: "Absent", value: 14, fill: "#ef4444" },
                              { name: "Sick Leave", value: 68, fill: "#facc15" },
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
                      <div className="absolute bottom-0 right-0 bg-teal-800 text-white text-xs px-2 py-1 rounded">
                        series-5: 60
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" checked readOnly />
                    <span className="text-sm text-gray-600">
                      Better than <span className="font-medium">85%</span> of Employees
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Summary Card */}
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle className="text-base">Leave Details</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3">
                  <span className="text-blue-600 font-medium">2024</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm">Total Leaves</p>
                    <p className="text-xl font-medium">16</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Taken</p>
                    <p className="text-xl font-medium">10</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Absent</p>
                    <p className="text-xl font-medium">2</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Request</p>
                    <p className="text-xl font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Worked Days</p>
                    <p className="text-xl font-medium">240</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Loss of Pay</p>
                    <p className="text-xl font-medium">2</p>
                  </div>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-black text-white">Apply New Leave</Button>
              </CardContent>
            </Card>

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

            {/* Projects Overview */}
            <Card className="row-span-2">
              <CardHeader>
                <CardTitle className="text-base">Projects Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Office Management",
                    manager: "Anthony Lewis",
                    joined: "14 Jan 2024",
                    tasks: "6/10",
                    timeSpent: "65/120 Hrs",
                    progress: 60,
                  },
                  {
                    name: "Office Management",
                    manager: "Harold Lewis",
                    joined: "14 Jan 2024",
                    tasks: "6/10",
                    timeSpent: "65/120 Hrs",
                    progress: 60,
                  },
                ].map((project, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.manager}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Joined:</span>
                        <span>{project.joined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tasks:</span>
                        <span>{project.tasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time Spent:</span>
                        <span>{project.timeSpent}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tasks Overview */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Tasks Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Patient appointment booking", status: "In Progress", color: "bg-blue-500" },
                    { name: "Appointment booking with payment", status: "Pending", color: "bg-yellow-500" },
                    { name: "Patient and Doctor video conferencing", status: "Pending", color: "bg-yellow-500" },
                    { name: "Private chat module", status: "Completed", color: "bg-green-500" },
                    {
                      name: "On-Call Live and Post-Implementation Support",
                      status: "In Progress",
                      color: "bg-blue-500",
                    },
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${task.color} mr-3`}></div>
                        <span>{task.name}</span>
                      </div>
                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "default"
                            : task.status === "In Progress"
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

            {/* Row 3: Performance, Skills, Team, Notifications, Meetings */}

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
                    <LineChart
                      data={[
                        { month: "Feb", performance: 75 },
                        { month: "Mar", performance: 82 },
                        { month: "Apr", performance: 78 },
                        { month: "May", performance: 85 },
                        { month: "Jun", performance: 92 },
                        { month: "Jul", performance: 98 },
                      ]}
                    >
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
                  <span className="text-2xl font-bold">98%</span>
                  <span className="ml-2 text-green-500 flex items-center text-sm">
                    <ChevronUp className="w-4 h-4" /> +13% vs last year
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* My Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Figma", updated: "13 May 2025", progress: 90 },
                  { name: "HTML", updated: "12 May 2025", progress: 85 },
                  { name: "CSS", updated: "12 May 2025", progress: 80 },
                  { name: "Javascript", updated: "15 May 2025", progress: 75 },
                  { name: "WordPress", updated: "13 May 2025", progress: 65 },
                ].map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-gray-500 text-xs">Updated {skill.updated}</span>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Smith", title: "UI Designer" },
                    { name: "Sarah Johnson", title: "Frontend Developer" },
                    { name: "Michael Brown", title: "Product Manager" },
                    { name: "Emily Davis", title: "UX Researcher" },
                    { name: "David Wilson", title: "Backend Developer" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.title}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { message: "Liam Murphy requested access to UNIX", time: "Today at 5:42 AM" },
                    { message: "Sarah Johnson commented on your task", time: "Yesterday at 2:30 PM" },
                    { message: "New project assigned: Website Redesign", time: "Yesterday at 10:15 AM" },
                    { message: "Meeting scheduled with Design Team", time: "Mar 10, 2025 at 3:00 PM" },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3"></div>
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Schedule Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meeting Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "09:25 AM", title: "Marketing Strategy Presentation", color: "bg-blue-500" },
                    { time: "09:20 AM", title: "Design Review", color: "bg-green-500" },
                    { time: "09:18 AM", title: "Birthday Celebration", color: "bg-purple-500" },
                    { time: "09:14 AM", title: "Update of Project Flow", color: "bg-orange-500" },
                  ].map((meeting, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${meeting.color} mt-1.5 mr-3`}></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">{meeting.time}</p>
                        <p className="text-sm">{meeting.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Birthday Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Birthday</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 flex items-center justify-center text-gray-600 text-xl font-bold">
                  AJ
                </div>
                <h3 className="font-medium">Andrew Jemima</h3>
                <p className="text-sm text-gray-500 mb-4">15th Sep 2025</p>
                <Button className="w-full mb-3">Send Wishes</Button>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button variant="outline" size="sm">
                    Leave Policy
                  </Button>
                  <Button variant="outline" size="sm">
                    Next Holiday
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
