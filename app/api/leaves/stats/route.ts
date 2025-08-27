import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Leave statistics endpoint
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current year for yearly statistics
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Calculate leave statistics for the current user
    const [
      approvedLeaves,
      pendingRequests,
      leaveTypeStats
    ] = await Promise.all([
      // Get approved leaves for the year
      prisma.leave.findMany({
        where: {
          userId: session.user.id,
          status: "APPROVED",
          startDate: {
            gte: startOfYear,
            lte: endOfYear
          }
        }
      }),

      // Count pending requests
      prisma.leave.count({
        where: {
          userId: session.user.id,
          status: "PENDING"
        }
      }),

      // Get leave type statistics for the year
      prisma.leave.groupBy({
        by: ['type'],
        where: {
          userId: session.user.id,
          status: "APPROVED",
          startDate: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        _count: {
          type: true
        }
      })
    ]);

    // Calculate days used from approved leaves
    let usedLeaveDays = 0;
    approvedLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
      usedLeaveDays += diffDays;
    });

    // Default total leave days per year (this could be configurable per company/user)
    const totalLeaveDays = 25;
    const remainingLeaveDays = Math.max(0, totalLeaveDays - usedLeaveDays);

    // Format leave type statistics
    const leaveTypesUsed = {
      SICK: 0,
      VACATION: 0,
      PERSONAL: 0,
      MATERNITY: 0,
      PATERNITY: 0,
      UNPAID: 0
    };

    leaveTypeStats.forEach(stat => {
      leaveTypesUsed[stat.type as keyof typeof leaveTypesUsed] = stat._count.type;
    });

    const stats = {
      totalLeaveDays,
      usedLeaveDays: Math.max(0, usedLeaveDays),
      remainingLeaveDays,
      pendingRequests,
      approvedThisYear: approvedLeaves.length,
      leaveTypesUsed
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching leave stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
