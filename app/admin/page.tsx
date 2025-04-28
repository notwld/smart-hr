"use client"
import { useState } from "react"
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  Grid,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Bar, BarChart, Cell, Pie, PieChart as RePieChart, ResponsiveContainer, XAxis } from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Stat Card Component
function StatCard({ icon, title, value, change, color, viewAll }) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
            {icon}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-xs ${color}`}>{change}</span>
            {viewAll && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                View All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Attendance Gauge Chart Component
  function AttendanceGaugeChart() {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={[
                { name: "Present", value: 59, color: "#22c55e" },
                { name: "Late", value: 21, color: "#f59e0b" },
                { name: "Permission", value: 2, color: "#3b82f6" },
                { name: "Absent", value: 18, color: "#ef4444" },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  // Tasks Donut Chart Component
  function TasksDonutChart() {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={taskStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              startAngle={0}
              endAngle={360}
            >
              {taskStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  // Sample Data
  const departmentData = [
    { name: "Development", count: 32, percentage: 100, color: "#FF6A00" },
    { name: "Marketing", count: 24, percentage: 75, color: "#0D6EFD" },
    { name: "HR", count: 16, percentage: 50, color: "#FFC107" },
    { name: "Management", count: 8, percentage: 25, color: "#198754" },
  ]
  
  const attendanceData = [
    { name: "Present", value: 75, percentage: 59, color: "#22c55e" },
    { name: "Late", value: 10, percentage: 21, color: "#f59e0b" },
    { name: "Permission", value: 8, percentage: 2, color: "#3b82f6" },
    { name: "Absent", value: 7, percentage: 18, color: "#ef4444" },
  ]
  
  const taskStatusData = [
    { name: "Ongoing", value: 25, percentage: 25, color: "#FFC107" },
    { name: "On Hold", value: 18, percentage: 18, color: "#0D6EFD" },
    { name: "Overdue", value: 17, percentage: 17, color: "#DC3545" },
    { name: "Ongoing", value: 40, percentage: 40, color: "#198754" },
  ]
  
  const clockInData = [
    {
      name: "Daniel Cabella",
      role: "UI/UX Designer",
      status: "On Time",
      clockIn: "10:30 AM",
      clockOut: "09:45 AM",
      production: "08:21 hrs",
    },
    { name: "Delphin Martini", role: "Project Manager", status: "On Time", clockIn: "09:45 AM" },
    { name: "Brian Villalobos", role: "PHP Developer", status: "On Time", clockIn: "09:30 AM" },
    { name: "Anthony Lewis", role: "Marketing Head", status: "Late", clockIn: "10:15 AM" },
  ]
  
  const todoItems = [
    { task: "Add Holidays", completed: false },
    { task: "Add Meeting to Client", completed: false },
    { task: "Chat with Admin", completed: false },
    { task: "Management Call", completed: false },
    { task: "Add Payroll", completed: false },
    { task: "Add Policy for Increment", completed: false },
  ]
  
  const applicantsData = [
    { name: "Brian Villalobos", age: "32", experience: "5+ Years", location: "USA", status: "Video Interview" },
    { name: "Anthony Lewis", age: "28", experience: "3+ Years", location: "USA", status: "Phone Interview" },
    { name: "Stephen Perch", age: "32", experience: "5+ Years", location: "USA", status: "On-site Interview" },
    { name: "Delphin Martini", age: "29", experience: "2+ Years", location: "USA", status: "Initial Screening" },
  ]
  
  const employeesData = [
    { name: "Anthony Lewis", role: "Finance", department: "Finance" },
    { name: "Brian Villalobos", role: "PHP Developer", department: "Development" },
    { name: "Stephen Perch", role: "Executive", department: "Marketing" },
    { name: "Delphin Martini", role: "Project Manager", department: "Manager" },
    { name: "Anthony Lewis", role: "UI/UX Designer", department: "Design" },
  ]
  
  const salesData = [
    { name: "Jan", income: 30 },
    { name: "Feb", income: 25 },
    { name: "Mar", income: 35 },
    { name: "Apr", income: 60 },
    { name: "May", income: 65 },
    { name: "Jun", income: 60 },
    { name: "Jul", income: 65 },
    { name: "Aug", income: 60 },
    { name: "Sep", income: 65 },
    { name: "Oct", income: 70 },
    { name: "Nov", income: 55 },
    { name: "Dec", income: 25 },
  ]
  
  const projectsData = [
    { id: "PRO-001", name: "Office Management App", hours: "12,500 hrs", deadline: "12 Sep 2024", priority: "High" },
    { id: "PRO-002", name: "Clinic Management", hours: "132,500 hrs", deadline: "24 Oct 2024", priority: "Low" },
    { id: "PRO-003", name: "Educational Platform", hours: "400,250 hrs", deadline: "18 Feb 2024", priority: "Medium" },
    { id: "PRO-004", name: "Chat & Call Mobile App", hours: "350,150 hrs", deadline: "18 Feb 2024", priority: "Medium" },
    { id: "PRO-005", name: "Travel Planning Website", hours: "300,250 hrs", deadline: "18 Feb 2024", priority: "Medium" },
    { id: "PRO-006", name: "Service Booking Software", hours: "402,550 hrs", deadline: "20 Feb 2024", priority: "Low" },
    { id: "PRO-008", name: "Travel Planning Website", hours: "132,250 hrs", deadline: "17 Oct 2024", priority: "Medium" },
  ]
  
  const activitiesData = [
    { name: "Matt Morgan", time: "02:30 PM", action: "Added New Project | CRM Dashboard" },
    { name: "Mary Donald", time: "02:00 PM", action: "Commented on | Uploaded Document" },
    { name: "George David", time: "02:30 PM", action: "Bookmarked Access to Module Tickets" },
    { name: "Aaron Zean", time: "02:00 PM", action: "Downloaded App Requests" },
    { name: "Hendry David", time: "02:30 PM", action: "Completed New Project | CRM" },
  ]
  
  const invoicesData = [
    { company: "Anderson Website", service: "SERVICES", type: "Logistics", amount: "3560" },
    { company: "Modular Corporation", service: "SERVICES", type: "One Corp", amount: "4175" },
    { company: "Change on Ergo Mobile", service: "SERVICES", type: "High LLP", amount: "5885" },
    { company: "Change on the Board", service: "SERVICES", type: "High LLP", amount: "1457" },
    { company: "Hospital Management", service: "SERVICES", type: "One Corp", amount: "5458" },
  ]

  
export default function AdminDashboard() {
    return(
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span>Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              2023
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Welcome Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-[#FF6A00]">
                    <AvatarImage src="/placeholder.svg?height=56&width=56" alt="Adrian" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">Welcome Back, Adrian</h2>
                    <p className="text-sm text-muted-foreground">
                      You have <span className="text-[#FF6A00]">2 Pending Approvals</span> &{" "}
                      <span className="text-[#FF6A00]">14 Leave Requests</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 bg-[#F0F6FE] text-[#0D6EFD]">
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                  <Button size="sm" className="gap-1 bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                    <Plus className="h-4 w-4" />
                    Add Requests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={
                <div className="rounded-full bg-orange-100 p-3 text-[#FF6A00]">
                  <Activity className="h-5 w-5" />
                </div>
              }
              title="Attendance Overview"
              value="120/154"
              change="+8.1%"
              color="text-[#FF6A00]"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-blue-100 p-3 text-blue-500">
                  <FileText className="h-5 w-5" />
                </div>
              }
              title="Total No.of Projects"
              value="90/125"
              change="+2.1%"
              color="text-blue-500"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-cyan-100 p-3 text-cyan-500">
                  <Users className="h-5 w-5" />
                </div>
              }
              title="Total No.of Clients"
              value="69/86"
              change="+12.1%"
              color="text-cyan-500"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-pink-100 p-3 text-pink-500">
                  <FileText className="h-5 w-5" />
                </div>
              }
              title="Total No.of Tasks"
              value="225/28"
              change="+16.5%"
              color="text-pink-500"
              viewAll={true}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={
                <div className="rounded-full bg-purple-100 p-3 text-purple-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              }
              title="Earnings"
              value="$21445"
              change="+18.2%"
              color="text-purple-500"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-red-100 p-3 text-red-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
              }
              title="Profit This Week"
              value="$5,944"
              change="+12.5%"
              color="text-red-500"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-green-100 p-3 text-green-500">
                  <Inbox className="h-5 w-5" />
                </div>
              }
              title="Job Applicants"
              value="98"
              change="+5.1%"
              color="text-green-500"
              viewAll={true}
            />
            <StatCard
              icon={
                <div className="rounded-full bg-gray-100 p-3 text-gray-500">
                  <Users className="h-5 w-5" />
                </div>
              }
              title="New Hire"
              value="45/48"
              change="+11.2%"
              color="text-gray-500"
              viewAll={true}
            />
          </div>

          {/* Charts and Tables Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employees By Department */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Employees by Department</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  This Week
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{dept.name}</span>
                        <span className="font-medium">{dept.count}</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${dept.percentage}%`,
                            backgroundColor: dept.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employee Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Employee Status</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  This Week
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Employees</div>
                    <div className="text-2xl font-bold">154</div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="flex h-full rounded-full">
                        <div className="h-full w-[48%] rounded-l-full bg-red-500"></div>
                        <div className="h-full w-[20%] bg-green-500"></div>
                        <div className="h-full w-[22%] bg-blue-500"></div>
                        <div className="h-full w-[10%] rounded-r-full bg-yellow-500"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                          <span className="text-xs">Fulltime (48%)</span>
                        </div>
                        <div className="text-lg font-bold">112</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                          <span className="text-xs">Contract (20%)</span>
                        </div>
                        <div className="text-lg font-bold">112</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                          <span className="text-xs">Probation (22%)</span>
                        </div>
                        <div className="text-lg font-bold">12</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
                          <span className="text-xs">Intern (10%)</span>
                        </div>
                        <div className="text-lg font-bold">04</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium">Top Performer</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Daniel" />
                        <AvatarFallback>DC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">Daniel Cabella</div>
                        <div className="text-xs text-muted-foreground">iOS Developer</div>
                      </div>
                    </div>
                    <div className="mt-2 text-right text-sm font-medium">Performance</div>
                    <div className="mt-1 text-right text-lg font-bold">95%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Attendance Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Attendance Overview</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  Today
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-[180px] w-[180px]">
                  <AttendanceGaugeChart />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-sm text-muted-foreground">Total Attendance</div>
                    <div className="text-2xl font-bold">120</div>
                  </div>
                </div>
                <div className="mt-4 grid w-full grid-cols-2 gap-2">
                  {attendanceData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-xs">{item.name}</span>
                        <span className="text-xs font-medium">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center pt-0">
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View Details
                </Button>
              </CardFooter>
            </Card>

            {/* Clock-In/Clock-Out */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Clock-In/Out</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  Today
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {clockInData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40&text=${item.name.charAt(0)}`}
                          alt={item.name}
                        />
                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`rounded-md ${
                          item.status === "On Time" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </Badge>
                      <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>• Clock In</span>
                          <span>{item.clockIn}</span>
                        </div>
                        {item.clockOut && (
                          <div className="flex items-center gap-1">
                            <span>• Clock Out</span>
                            <span>{item.clockOut}</span>
                          </div>
                        )}
                        {item.production && (
                          <div className="flex items-center gap-1">
                            <span>• Production</span>
                            <span>{item.production}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-center pt-0">
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All Attendance
                </Button>
              </CardFooter>
            </Card>

            {/* Todo List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Todo</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  Today
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {todoItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded border border-input">
                      <Checkbox id={`todo-${index}`} className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`todo-${index}`} className="text-sm font-medium">
                        {item.task}
                      </label>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-between pt-0">
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
                <Button size="sm" className="h-8 rounded-full bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Job Applicants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Jobs Applicants</CardTitle>
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-2 text-sm font-medium">
                    <div>Openings</div>
                    <div>Applicants</div>
                  </div>
                  {applicantsData.map((applicant, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 rounded-md p-2 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${applicant.name.charAt(0)}`}
                            alt={applicant.name}
                          />
                          <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{applicant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Age: {applicant.age} • {applicant.experience} • {applicant.location}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge
                          className={`rounded-md ${
                            applicant.status === "Video Interview"
                              ? "bg-blue-100 text-blue-800"
                              : applicant.status === "Phone Interview"
                                ? "bg-purple-100 text-purple-800"
                                : applicant.status === "On-site Interview"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {applicant.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employees */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Employees</CardTitle>
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-2 text-sm font-medium">
                    <div>Employee</div>
                    <div>Department</div>
                  </div>
                  {employeesData.map((employee, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 rounded-md p-2 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${employee.name.charAt(0)}`}
                            alt={employee.name}
                          />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          className={`rounded-md ${
                            employee.department === "Finance"
                              ? "bg-orange-100 text-orange-800"
                              : employee.department === "Development"
                                ? "bg-blue-100 text-blue-800"
                                : employee.department === "Marketing"
                                  ? "bg-purple-100 text-purple-800"
                                  : employee.department === "Manager"
                                    ? "bg-pink-100 text-pink-800"
                                    : "bg-green-100 text-green-800"
                          }`}
                        >
                          {employee.department}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Sales Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <div className="h-2 w-2 rounded-full bg-[#FF6A00]"></div>
                  Income
                </Badge>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Expenses
                </Badge>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  All Departments
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <Bar dataKey="income" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Projects</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-md font-normal">
                <Clock className="h-3 w-3" />
                This Week
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsData.map((project, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${i}`} alt="Team member" />
                              <AvatarFallback className="text-xs">{i}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{project.hours}</TableCell>
                      <TableCell>{project.deadline}</TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-md ${
                            project.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : project.priority === "Medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {project.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tasks Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Tasks Statistics</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-md font-normal">
                <Clock className="h-3 w-3" />
                This Week
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-[200px] w-[200px]">
                <TasksDonutChart />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                  <div className="text-2xl font-bold">124/165</div>
                </div>
              </div>
              <div className="mt-4 grid w-full grid-cols-4 gap-2">
                {taskStatusData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <div className="text-sm font-medium">{item.percentage}%</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 w-full rounded-md bg-gray-50 p-2 text-center text-sm">
                <span className="font-medium">379,689 hrs</span>
                <span className="text-muted-foreground"> Spent on Overall Tasks This Week</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities and Birthdays */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Schedules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Schedules</CardTitle>
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-blue-50 p-2">
                  <div className="text-sm font-medium text-blue-800">Interview Candidates - UI/UX Designer</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-blue-600">
                    <Calendar className="h-3 w-3" />
                    <span>Thu, 13 Feb 2023</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>10:00 AM - 12:00 PM</span>
                  </div>
                  <div className="mt-2 flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${i}`} alt="Team member" />
                        <AvatarFallback className="text-xs">{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-sm font-medium">Interview Candidates - iOS Developer</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Thu, 13 Feb 2023</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>10:00 AM - 12:00 PM</span>
                  </div>
                  <div className="mt-2 flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${i}`} alt="Team member" />
                        <AvatarFallback className="text-xs">{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activitiesData.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${activity.name.charAt(0)}`}
                          alt={activity.name}
                        />
                        <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{activity.name}</span>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Birthdays */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Birthdays</CardTitle>
                <Button variant="link" size="sm" className="text-[#FF6A00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-medium">Today</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=A" alt="Andrew" />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">Andrew James</div>
                        <div className="text-xs text-muted-foreground">iOS Developer</div>
                      </div>
                      <Button size="sm" className="ml-auto h-7 rounded-full bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                        Wish
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium">Tomorrow</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=M" alt="Mary" />
                        <AvatarFallback>MZ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">Mary Zenn</div>
                        <div className="text-xs text-muted-foreground">UI/UX Designer</div>
                      </div>
                      <Button size="sm" className="ml-auto h-7 rounded-full bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                        Wish
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium">25 Jun 2023</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=A" alt="Anthony" />
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">Anthony Lewis</div>
                        <div className="text-xs text-muted-foreground">Android Developer</div>
                      </div>
                      <Button size="sm" className="ml-auto h-7 rounded-full bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                        Wish
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium">28 Jun 2023</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=D" alt="Delphin" />
                        <AvatarFallback>DM</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">Delphin Martini</div>
                        <div className="text-xs text-muted-foreground">iOS Developer</div>
                      </div>
                      <Button size="sm" className="ml-auto h-7 rounded-full bg-[#FF6A00] hover:bg-[#FF6A00]/90">
                        Wish
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Invoices</CardTitle>
                <Badge variant="outline" className="gap-1 rounded-md font-normal">
                  <Clock className="h-3 w-3" />
                  This Week
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoicesData.map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${invoice.company.charAt(0)}`}
                            alt={invoice.company}
                          />
                          <AvatarFallback>{invoice.company.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{invoice.company}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.service} • {invoice.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${invoice.amount}</div>
                        <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
}