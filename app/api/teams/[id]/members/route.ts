import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST - Add member(s) to a team
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const data = await req.json();
    const { memberIds } = data;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ message: "Member IDs are required" }, { status: 400 });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          select: { userId: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if user has permission to add members
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    const isTeamLeader = team.leaderId === session.user.id;
    const isAdminOrManager = user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER';

    if (!isTeamLeader && !isAdminOrManager) {
      return NextResponse.json({ message: "Unauthorized to add members to this team" }, { status: 403 });
    }

    // Filter out users who are already members
    const existingMemberIds = team.members.map(member => member.userId);
    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      return NextResponse.json({ message: "All specified users are already team members" }, { status: 400 });
    }

    // Verify all users exist
    const users = await prisma.user.findMany({
      where: { id: { in: newMemberIds } },
      select: { id: true }
    });

    if (users.length !== newMemberIds.length) {
      return NextResponse.json({ message: "One or more specified users do not exist" }, { status: 404 });
    }

    // Add members to team and update reporting structure
    const memberPromises = newMemberIds.map(async (userId: string) => {
      // Add member to team
      await prisma.teamMember.create({
        data: {
          teamId: id,
          userId
        }
      });

      // Update user's reportsTo field to point to the team leader
      await prisma.user.update({
        where: { id: userId },
        data: { reportsToId: team.leaderId }
      });
    });

    await Promise.all(memberPromises);

    // Get updated team with members
    const updatedTeam = await prisma.team.findUnique({
      where: { id },
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
    console.error("Error adding team members:", error);
    return NextResponse.json({ message: "Error adding team members" }, { status: 500 });
  }
}

// DELETE - Remove a member from a team
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
          select: { id: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    if (team.members.length === 0) {
      return NextResponse.json({ message: "User is not a member of this team" }, { status: 404 });
    }

    // Check if user has permission to remove members
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    const isTeamLeader = team.leaderId === session.user.id;
    const isAdminOrManager = user?.legacyRole === 'ADMIN' || user?.legacyRole === 'MANAGER';

    if (!isTeamLeader && !isAdminOrManager) {
      return NextResponse.json({ message: "Unauthorized to remove members from this team" }, { status: 403 });
    }

    // Cannot remove the team leader
    if (userId === team.leaderId) {
      return NextResponse.json({ message: "Cannot remove the team leader from the team" }, { status: 400 });
    }

    // Remove member from team
    await prisma.teamMember.deleteMany({
      where: {
        teamId: id,
        userId
      }
    });

    // Update user's reportsTo field if they report to the team leader
    const memberUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { reportsToId: true }
    });

    if (memberUser && memberUser.reportsToId === team.leaderId) {
      await prisma.user.update({
        where: { id: userId },
        data: { reportsToId: null }
      });
    }

    return NextResponse.json({ message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ message: "Error removing team member" }, { status: 500 });
  }
} 