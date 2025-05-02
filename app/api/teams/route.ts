import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - List all teams
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // Check if the user is an admin or manager, who can see all teams
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });
    
    let teams;
    
    // Admins and managers can see all teams
    if (user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER') {
      teams = await prisma.team.findMany({
        include: {
          leader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  position: true,
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Regular employees can only see teams they're part of or leading
      teams = await prisma.team.findMany({
        where: {
          OR: [
            { leaderId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        },
        include: {
          leader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  position: true,
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ message: "Error fetching teams" }, { status: 500 });
  }
}

// POST - Create a new team
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // Check if the user is an admin or manager who can create teams
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    if (user?.legacyRole !== 'ADMIN' && user?.legacyRole !== 'MANAGER') {
      return NextResponse.json({ message: "Unauthorized - Only admins and managers can create teams" }, { status: 403 });
    }

    const data = await req.json();
    const { name, description, leaderId, memberIds = [] } = data;

    if (!name || !leaderId) {
      return NextResponse.json({ message: "Team name and leader are required" }, { status: 400 });
    }

    // Check if leader exists and is a manager or has appropriate role
    const leaderUser = await prisma.user.findUnique({
      where: { id: leaderId }
    });

    if (!leaderUser) {
      return NextResponse.json({ message: "Team leader not found" }, { status: 404 });
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        leaderId
      }
    });

    // Add members to the team and update their reporting structure
    if (memberIds.length > 0) {
      // Create team members
      const memberPromises = memberIds.map(async (userId: string) => {
        // Add member to team
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId
          }
        });

        // Update user's reportsTo field to point to the team leader
        await prisma.user.update({
          where: { id: userId },
          data: { reportsToId: leaderId }
        });
      });

      await Promise.all(memberPromises);
    }

    // Return the new team with members
    const createdTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(createdTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ message: "Error creating team" }, { status: 500 });
  }
} 