"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmployeeLiveStats } from "@/components/dashboard/cards/EmployeeLiveStats";
import { Clock, Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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

interface EmployeeInfo {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface EmployeeAttendanceResponse {
  attendance: AttendanceRecord[];
  employee: EmployeeInfo;
}

interface DayStatsResult {
  stats: {
    totalWorkingHours: number;
    productiveHours: number;
    breakHours: number;
    overtimeHours: number;
  };
  timelineSegments: Array<{
    type: "productive" | "break" | "overtime";
    startTime: string;
    endTime: string | null;
    duration: number;
  }>;
  breaks: BreakRecord[];
  activeBreak: BreakRecord | null;
}

function calculateDayStats(attendance: AttendanceRecord): DayStatsResult | null {
  if (!attendance?.checkInTime) return null;

  const checkInTime = new Date(attendance.checkInTime);
  if (Number.isNaN(checkInTime.getTime())) return null;

  const now = new Date();
  const endTime = attendance.checkOutTime ? new Date(attendance.checkOutTime) : now;
  if (Number.isNaN(endTime.getTime()) || endTime <= checkInTime) return null;

  const totalWorkingMs = endTime.getTime() - checkInTime.getTime();
  const totalWorkingHours = totalWorkingMs / (1000 * 60 * 60);

  const breaks = attendance.breaks ?? [];
  const completedBreaks = breaks.filter(b => b && b.endTime !== null);
  const activeBreak = breaks.find(b => b && b.endTime === null) ?? null;

  const totalBreakMinutes = completedBreaks.reduce((sum, b) => sum + (b.duration ?? 0), 0);

  const activeBreakEndTime = activeBreak
    ? (attendance.checkOutTime ? new Date(attendance.checkOutTime) : now)
    : null;

  const currentBreakMinutes =
    activeBreak && activeBreakEndTime
      ? Math.max(
          0,
          (activeBreakEndTime.getTime() - new Date(activeBreak.startTime).getTime()) /
            (1000 * 60)
        )
      : 0;

  const totalBreakHours = (totalBreakMinutes + currentBreakMinutes) / 60;
  const productiveHours = Math.max(0, totalWorkingHours - totalBreakHours);

  const standardWorkHours = 8;
  const overtimeHours = Math.max(0, productiveHours - standardWorkHours);
  const adjustedProductiveHours = Math.min(productiveHours, standardWorkHours);

  const timelineSegments: Array<{
    type: "productive" | "break" | "overtime";
    startTime: Date;
    endTime: Date | null;
    duration: number;
  }> = [];

  let currentTime = new Date(checkInTime);

  const allBreaks = [...completedBreaks];
  if (activeBreak) {
    allBreaks.push({
      ...activeBreak,
      endTime: null,
      duration: currentBreakMinutes / 60,
    });
  }
  allBreaks.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  for (const breakRecord of allBreaks) {
    const breakStart = new Date(breakRecord.startTime);
    const breakEnd = breakRecord.endTime
      ? new Date(breakRecord.endTime)
      : attendance.checkOutTime
      ? new Date(attendance.checkOutTime)
      : now;

    if (breakEnd <= breakStart) continue;

    if (currentTime < breakStart) {
      const productiveDuration =
        (breakStart.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      if (productiveDuration > 0) {
        timelineSegments.push({
          type: "productive",
          startTime: new Date(currentTime),
          endTime: new Date(breakStart),
          duration: productiveDuration,
        });
      }
    }

    const breakDuration =
      (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
    if (breakDuration > 0) {
      timelineSegments.push({
        type: "break",
        startTime: new Date(breakStart),
        endTime: new Date(breakEnd),
        duration: breakDuration,
      });
    }

    currentTime = new Date(breakEnd);
  }

  if (currentTime < endTime) {
    const remainingDuration =
      (endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    if (remainingDuration > 0) {
      const standardWorkEndTime = new Date(checkInTime);
      standardWorkEndTime.setHours(
        standardWorkEndTime.getHours() + standardWorkHours
      );

      if (currentTime >= standardWorkEndTime) {
        timelineSegments.push({
          type: "overtime",
          startTime: new Date(currentTime),
          endTime: new Date(endTime),
          duration: remainingDuration,
        });
      } else if (endTime <= standardWorkEndTime) {
        timelineSegments.push({
          type: "productive",
          startTime: new Date(currentTime),
          endTime: new Date(endTime),
          duration: remainingDuration,
        });
      } else {
        const productiveDuration =
          (standardWorkEndTime.getTime() - currentTime.getTime()) /
          (1000 * 60 * 60);
        const overtimeDuration =
          (endTime.getTime() - standardWorkEndTime.getTime()) /
          (1000 * 60 * 60);

        if (productiveDuration > 0) {
          timelineSegments.push({
            type: "productive",
            startTime: new Date(currentTime),
            endTime: new Date(standardWorkEndTime),
            duration: productiveDuration,
          });
        }

        if (overtimeDuration > 0) {
          timelineSegments.push({
            type: "overtime",
            startTime: new Date(standardWorkEndTime),
            endTime: new Date(endTime),
            duration: overtimeDuration,
          });
        }
      }
    }
  }

  return {
    stats: {
      totalWorkingHours,
      productiveHours: adjustedProductiveHours,
      breakHours: totalBreakHours,
      overtimeHours,
    },
    timelineSegments: timelineSegments.map((segment) => ({
      ...segment,
      startTime: segment.startTime.toISOString(),
      endTime: segment.endTime ? segment.endTime.toISOString() : null,
    })),
    breaks,
    activeBreak,
  };
}

const RECORDS_PER_PAGE = 7;

export default function EmployeeAttendancePage() {
  const params = useParams<{ id: string }>();
  const employeeId = params?.id;
  const router = useRouter();

  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!employeeId) return;

    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!year || !month) return;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
      lastDay
    ).padStart(2, "0")}`;

    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setEmployee(null);
          setAttendance([]);
          return;
        }

        const data: EmployeeAttendanceResponse = await res.json();
        setEmployee(data.employee ?? null);
        const sorted = (data.attendance ?? []).slice().sort((a, b) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return db - da;
        });
        setAttendance(sorted);
        setCurrentPage(1);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setEmployee(null);
          setAttendance([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [employeeId, selectedMonth]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(attendance.length / RECORDS_PER_PAGE)),
    [attendance.length]
  );

  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return attendance.slice(start, start + RECORDS_PER_PAGE);
  }, [attendance, currentPage]);

  const monthlySummary = useMemo(() => {
    if (!attendance.length) {
      return {
        workingDays: 0,
        presentDays: 0,
        absentDays: 0,
        totalWorkingHours: 0,
        totalProductiveHours: 0,
        totalBreakHours: 0,
        totalOvertimeHours: 0,
        maxProductiveHours: 0,
      };
    }

    let workingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let totalWorkingHours = 0;
    let totalProductiveHours = 0;
    let totalBreakHours = 0;
    let totalOvertimeHours = 0;

    for (const record of attendance) {
      const dateObj = new Date(record.date);
      if (Number.isNaN(dateObj.getTime())) continue;

      const day = dateObj.getDay(); // 0 Sunday, 6 Saturday
      const hasAttendance = !!record.checkInTime;

      const isWorkingDay =
        day !== 0 && // Sunday off
        (day !== 6 || hasAttendance); // Saturday off unless attendance exists

      if (isWorkingDay) {
        workingDays += 1;
      }

      if (record.status === "ABSENT") {
        absentDays += 1;
      } else if (record.status === "PRESENT" || record.status === "LATE" || record.status === "HAF_DAY" || record.status === "HALF_DAY") {
        presentDays += 1;
      }

      const stats = calculateDayStats(record);
      if (!stats) continue;

      totalWorkingHours += stats.stats.totalWorkingHours;
      totalProductiveHours += stats.stats.productiveHours;
      totalBreakHours += stats.stats.breakHours;
      totalOvertimeHours += stats.stats.overtimeHours;
    }

    const maxProductiveHours = workingDays * 8;

    return {
      workingDays,
      presentDays,
      absentDays,
      totalWorkingHours,
      totalProductiveHours,
      totalBreakHours,
      totalOvertimeHours,
      maxProductiveHours,
    };
  }, [attendance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>
                  <div className="text-sm uppercase tracking-wide text-white/60">
                    Employee Attendance History
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {employee
                      ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
                        "Employee"
                      : "Employee"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 text-white border-white/20">
                  <Calendar className="h-4 w-4 mr-1" />
                  Monthly View
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800 gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Month
                </label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800 gap-2">
              <Clock className="w-5 h-5" />
              Month Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="text-xs font-medium text-green-700 mb-1">
                  Present Days
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {monthlySummary.presentDays}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  out of {monthlySummary.workingDays} working days
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="text-xs font-medium text-red-700 mb-1">
                  Absent Days
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {monthlySummary.absentDays}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-xs font-medium text-blue-700 mb-1">
                  Productive Hours
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {monthlySummary.totalProductiveHours.toFixed(1)}h
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  of {monthlySummary.maxProductiveHours.toFixed(1)}h target
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="text-xs font-medium text-yellow-700 mb-1">
                  Break / Overtime
                </div>
                <div className="text-sm text-yellow-800">
                  Break:{" "}
                  <span className="font-semibold">
                    {monthlySummary.totalBreakHours.toFixed(1)}h
                  </span>
                </div>
                <div className="text-sm text-yellow-800">
                  Overtime:{" "}
                  <span className="font-semibold">
                    {monthlySummary.totalOvertimeHours.toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800 gap-2">
              <Clock className="w-5 h-5" />
              Attendance Days
              <Badge className="ml-2 bg-cyan-50 text-cyan-700 border-cyan-200">
                {attendance.length} days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader size="lg" text="Loading attendance history..." />
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No attendance records found for this month.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedAttendance.map((record) => {
                  const dayStats = calculateDayStats(record);
                  if (!dayStats) {
                    return null;
                  }

                  const dateObj = new Date(record.date);
                  const title = dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                  const subtitle = dateObj.toLocaleDateString("en-US", {
                    year: "numeric",
                  });

                  return (
                    <EmployeeLiveStats
                      key={record.id}
                      attendanceId={record.id}
                      user={{
                        id: employee?.id ?? "",
                        firstName: employee?.firstName ?? "",
                        lastName: employee?.lastName ?? "",
                        position: null,
                        department: null,
                        email: null,
                        pfp: null,
                      }}
                      title={title}
                      subtitle={subtitle}
                      avatarInitials={`${employee?.firstName ?? ""}${employee?.lastName ?? ""}`}
                      checkInTime={record.checkInTime ?? ""}
                      checkOutTime={record.checkOutTime}
                      stats={dayStats.stats}
                      timelineSegments={dayStats.timelineSegments}
                      activeBreak={dayStats.activeBreak}
                    />
                  );
                })}

                {totalPages > 1 && (
                  <div className="mt-4 p-4 bg-[#dff9ff] rounded-lg border border-cyan-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page{" "}
                      <span className="font-semibold text-cyan-600">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-cyan-600">
                        {totalPages}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages, p + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

