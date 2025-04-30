import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    const leavesHistory = await prisma.leave.findMany({
      where: { 
        userId: session.user.id 
      },
      orderBy: {
        startDate: 'desc'
      },
      take: limit
    });

    return NextResponse.json(leavesHistory, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching leave history" }, { status: 500 });
  }
} 