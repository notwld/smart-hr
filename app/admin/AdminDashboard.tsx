"use client"
import React, { useState } from "react"
import {
  Users,
  Clock,
  Calendar,
  Bell,
  BarChart3,
  Ticket
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PermissionGuard from "@/components/PermissionGuard"
import EmployeeCalendar from "@/components/EmployeeCalendar"

// Tab Components
import LeavesTab from "@/components/admin/LeavesTab"
import NotificationsTab from "@/components/admin/NotificationsTab"
import EmployeesTab from "@/components/admin/EmployeesTab"
import AttendanceTab from "@/components/admin/AttendanceTab"
import TicketsTab from "@/components/admin/TicketsTab"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Employee calendar dialog handlers
  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    setShowCalendar(true);
  };

  return (
    <PermissionGuard 
      permissions="dashboard.admin"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <Card className="p-8 text-center border-0 shadow-lg">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Access Denied</h2>
            <p className="text-gray-500">You don't have permission to view the admin dashboard.</p>
          </Card>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <div className="w-full space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-800 to-slate-900">
            <CardHeader className="text-white">
              <CardTitle className="text-3xl font-bold flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                Welcome Back!
              </CardTitle>
             
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="attendance"
                    className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
                  >
                    <Clock className="w-4 h-4" />
                    Attendance
                  </TabsTrigger>
                  <TabsTrigger
                    value="employees"
                    className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                  >
                    <Users className="w-4 h-4" />
                    Employees
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaves"
                    className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                  >
                    <Calendar className="w-4 h-4" />
                    Leaves
                  </TabsTrigger>
                  <TabsTrigger
                    value="tickets"
                    className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    <Ticket className="w-4 h-4" />
                    Tickets
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            {/* Tab Content */}
            <TabsContent value="attendance" className="mt-6">
              <AttendanceTab />
            </TabsContent>

            <TabsContent value="employees" className="mt-6">
              <EmployeesTab />
            </TabsContent>

            <TabsContent value="leaves" className="mt-6">
              <LeavesTab />
            </TabsContent>

            <TabsContent value="tickets" className="mt-6">
              <TicketsTab />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationsTab />
            </TabsContent>
          </Tabs>

          {/* Employee Calendar Dialog */}
          <EmployeeCalendar
            isOpen={showCalendar}
            onClose={() => {
              setShowCalendar(false);
              setSelectedEmployee(null);
            }}
            employee={selectedEmployee}
          />
        </div>
      </div>
    </PermissionGuard>
  )
}
