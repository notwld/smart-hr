import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Get a specific team by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    
    // First check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            legacyRole: true,
            image: true,
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
                department: true,
                legacyRole: true,
                image: true,
              }
            }
          },
          orderBy: {
            joinedAt: 'desc'
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check access permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    const isTeamLeader = team.leaderId === session.user.id;
    const isTeamMember = team.members.some(member => member.userId === session.user.id);
    const isAdminOrManager = user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER';

    if (!isTeamLeader && !isTeamMember && !isAdminOrManager) {
      return NextResponse.json({ message: "Unauthorized to view this team" }, { status: 403 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ message: "Error fetching team" }, { status: 500 });
  }
}

// PUT - Update a team
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const data = await req.json();
    const { name, description, leaderId } = data;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: { id: true }
        },
        members: {
          select: { userId: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if user has permission to update the team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    const isTeamLeader = team.leaderId === session.user.id;
    const isAdminOrManager = user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER';

    if (!isTeamLeader && !isAdminOrManager) {
      return NextResponse.json({ message: "Unauthorized to update this team" }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // Leader can only be changed by admin or manager
    if (leaderId && leaderId !== team.leaderId && isAdminOrManager) {
      // Check if new leader exists
      const newLeader = await prisma.user.findUnique({
        where: { id: leaderId }
      });

      if (!newLeader) {
        return NextResponse.json({ message: "New team leader not found" }, { status: 404 });
      }
      
      updateData.leaderId = leaderId;
      
      // Update reporting relationships for team members if leader changes
      await prisma.user.updateMany({
        where: {
          id: { in: team.members.map((member: { userId: string }) => member.userId) },
          reportsToId: team.leaderId
        },
        data: {
          reportsToId: leaderId
        }
      });
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ message: "Error updating team" }, { status: 500 });
  }
}

// DELETE - Delete a team
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if user has permission to delete the team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    const isAdminOrManager = user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER';

    if (!isAdminOrManager) {
      return NextResponse.json({ message: "Unauthorized to delete this team" }, { status: 403 });
    }

    // Remove reporting relationships for team members
    if (team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      
      await prisma.user.updateMany({
        where: {
          id: { in: memberIds },
          reportsToId: team.leaderId
        },
        data: {
          reportsToId: null
        }
      });
    }

    // Delete the team - this will cascade delete team members
    await prisma.team.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ message: "Error deleting team" }, { status: 500 });
  }
} 