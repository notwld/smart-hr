import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

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

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        documents: true,
        bankDetails: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { message: "Error fetching employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Fetch the user's role from the database
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    if (!currentUser || currentUser.legacyRole !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      username,
      firstName,
      lastName,
      email,
      cnic,
      password,
      salary,
      address,
      department,
      position,
      joinDate,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      image,
      emergencyContact,
      education,
      experience,
      documents,
      bankDetails,
    } = data;

    // Validate required fields
    if (!username || !firstName || !lastName || !email || !cnic || 
        !salary || !address || !department || !position || !joinDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate salary is a number
    if (typeof salary !== 'number' || salary < 0) {
      return NextResponse.json(
        { message: "Invalid salary value" },
        { status: 400 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await hash(password, 12) : undefined;

    // Update employee with all related data
    const employee = await prisma.user.update({
      where: { id: params.id },
      data: {
        username,
        firstName,
        lastName,
        email,
        cnic,
        ...(hashedPassword && { password: hashedPassword }),
        salary: Number(salary),
        address,
        department,
        position,
        joinDate: new Date(joinDate),
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        maritalStatus,
        image,
        emergencyContact: emergencyContact ? {
          upsert: {
            create: emergencyContact,
            update: emergencyContact,
          },
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education.map((edu: any) => ({
            ...edu,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience.map((exp: any) => ({
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        } : undefined,
        documents: documents ? {
          deleteMany: {},
          create: documents,
        } : undefined,
        bankDetails: bankDetails ? {
          upsert: {
            create: bankDetails,
            update: bankDetails,
          },
        } : undefined,
      },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        documents: true,
        bankDetails: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { message: "Error updating employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id: targetUserId } = await params;

    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true },
    });

    if (!currentUser || currentUser.legacyRole !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Phase 1: Clear references from other users/records to this user
      await tx.user.updateMany({
        where: { reportsToId: targetUserId },
        data: { reportsToId: null },
      });
      await tx.leave.updateMany({
        where: {
          OR: [
            { managerId: targetUserId },
            { adminId: targetUserId },
          ],
        },
        data: { managerId: null, adminId: null },
      });
      await tx.ticket.updateMany({
        where: {
          OR: [
            { assignedToId: targetUserId },
            { resolvedById: targetUserId },
          ],
        },
        data: { assignedToId: null, resolvedById: null },
      });
      await tx.lead.updateMany({
        where: {
          OR: [
            { userId: targetUserId },
            { assigneeId: targetUserId },
          ],
        },
        data: { userId: null, assigneeId: null },
      });
      await tx.card.updateMany({
        where: { assignedToId: targetUserId },
        data: { assignedToId: null },
      });

      // Teams: remove user from team; if leader, assign another member or delete team if only member
      const teamsLedByUser = await tx.team.findMany({
        where: { leaderId: targetUserId },
        select: { id: true },
      });
      for (const team of teamsLedByUser) {
        const otherMember = await tx.teamMember.findFirst({
          where: {
            teamId: team.id,
            userId: { not: targetUserId },
          },
          select: { userId: true },
        });
        if (otherMember) {
          await tx.team.update({
            where: { id: team.id },
            data: { leaderId: otherMember.userId },
          });
        } else {
          await tx.team.delete({ where: { id: team.id } });
        }
      }
      await tx.teamMember.deleteMany({ where: { userId: targetUserId } });

      // Phase 2: Delete records owned or authored by this user
      await tx.ticketComment.deleteMany({
        where: { authorId: targetUserId },
      });
      await tx.ticketAttachment.deleteMany({
        where: { uploadedById: targetUserId },
      });
      await tx.ticketActivity.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.ticket.deleteMany({
        where: { createdById: targetUserId },
      });
      await tx.notification.deleteMany({
        where: { createdById: targetUserId },
      });
      await tx.board.deleteMany({
        where: { createdById: targetUserId },
      });
      await tx.cardComment.deleteMany({
        where: { authorId: targetUserId },
      });
      await tx.cardActivity.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.card.deleteMany({
        where: { createdById: targetUserId },
      });
      await tx.chatMessage.deleteMany({
        where: { senderId: targetUserId },
      });
      await tx.messageReaction.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.messageMention.deleteMany({
        where: { userId: targetUserId },
      });

      // Phase 3: Delete user-owned records
      await tx.userRole.deleteMany({ where: { userId: targetUserId } });
      await tx.emergencyContact.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.education.deleteMany({ where: { userId: targetUserId } });
      await tx.experience.deleteMany({ where: { userId: targetUserId } });
      await tx.document.deleteMany({ where: { userId: targetUserId } });
      await tx.bankDetails.deleteMany({
        where: { userId: targetUserId },
      });
      const attendances = await tx.attendance.findMany({
        where: { userId: targetUserId },
        select: { id: true },
      });
      const attendanceIds = attendances.map((a) => a.id);
      if (attendanceIds.length > 0) {
        await tx.break.deleteMany({
          where: { attendanceId: { in: attendanceIds } },
        });
      }
      await tx.attendance.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.leave.deleteMany({ where: { userId: targetUserId } });
      await tx.task.deleteMany({
        where: { assignedTo: targetUserId },
      });
      await tx.skill.deleteMany({ where: { userId: targetUserId } });
      await tx.performance.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.projectAssignment.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.notificationRecipient.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.chatParticipant.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.userLastSeen.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.meeting.deleteMany({ where: { userId: targetUserId } });
      await tx.boardMember.deleteMany({
        where: { userId: targetUserId },
      });
      await tx.boardStar.deleteMany({
        where: { userId: targetUserId },
      });

      await tx.user.delete({ where: { id: targetUserId } });
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { message: "Error deleting employee" },
      { status: 500 }
    );
  }
} 