import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get expired hostings
    const expiredHostings = await (prisma as any).hosting.findMany({
      where: {
        expiryDate: { lt: now }
      },
      orderBy: { expiryDate: "desc" },
    });

    // Get hostings expiring within 7 days
    const expiringHostings = await (prisma as any).hosting.findMany({
      where: {
        expiryDate: { 
          gte: now,
          lte: nextWeek 
        }
      },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json({
      expired: expiredHostings,
      expiring: expiringHostings,
      totalExpired: expiredHostings.length,
      totalExpiring: expiringHostings.length,
    });
  } catch (error) {
    console.error("Error fetching hosting notifications:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
