import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user's team membership and team leader
    const teamMembership = await prisma.teamMember.findFirst({
      where: { userId: params.id },
      include: {
        team: {
          include: {
            leader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!teamMembership || !teamMembership.team.leader) {
      return NextResponse.json(
        { leader: null }
      );
    }

    return NextResponse.json({ 
      leader: teamMembership.team.leader
    });
  } catch (error) {
    console.error("Error fetching team leader:", error);
    return NextResponse.json(
      { message: "Error fetching team leader" },
      { status: 500 }
    );
  }
} 