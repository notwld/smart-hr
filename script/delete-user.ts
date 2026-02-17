/**
 * One-time script: Delete a single user and ALL related data by userId.
 * Only affects the given user id; no other users are modified except
 * clearing references (e.g. reportsToId, managerId) that pointed to this user.
 * For teams: removes the user from the team; if they were leader, assigns another
 * member as leader. If they were the only member, that team is deleted.
 *
 * Usage: npx ts-node script/delete-user.ts
 */

import { PrismaClient } from "../lib/generated/prisma";

const TARGET_USER_ID = "cmdg7mc8d0000fi9xjjn2sq2y";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { id: TARGET_USER_ID },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!existing) {
    console.log(`User with id ${TARGET_USER_ID} not found. Nothing to delete.`);
    return;
  }

  console.log(
    `Deleting user: ${existing.firstName} ${existing.lastName} (${existing.email}) and all related data...`
  );

  await prisma.$transaction(async (tx) => {
    // --- Phase 1: Clear references FROM other users/records TO this user ---
    await tx.user.updateMany({
      where: { reportsToId: TARGET_USER_ID },
      data: { reportsToId: null },
    });
    await tx.leave.updateMany({
      where: { OR: [{ managerId: TARGET_USER_ID }, { adminId: TARGET_USER_ID }] },
      data: { managerId: null, adminId: null },
    });
    await tx.ticket.updateMany({
      where: {
        OR: [
          { assignedToId: TARGET_USER_ID },
          { resolvedById: TARGET_USER_ID },
        ],
      },
      data: { assignedToId: null, resolvedById: null },
    });
    await tx.lead.updateMany({
      where: {
        OR: [{ userId: TARGET_USER_ID }, { assigneeId: TARGET_USER_ID }],
      },
      data: { userId: null, assigneeId: null },
    });
    await tx.card.updateMany({
      where: { assignedToId: TARGET_USER_ID },
      data: { assignedToId: null },
    });

    // Teams: remove user from team; if user was leader, assign another member as leader (or delete team if only member)
    const teamsLedByUser = await tx.team.findMany({
      where: { leaderId: TARGET_USER_ID },
      select: { id: true },
    });
    for (const team of teamsLedByUser) {
      const otherMember = await tx.teamMember.findFirst({
        where: {
          teamId: team.id,
          userId: { not: TARGET_USER_ID },
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
    await tx.teamMember.deleteMany({ where: { userId: TARGET_USER_ID } });

    // --- Phase 2: Delete records that reference this user (owned by or authored by) ---
    await tx.ticketComment.deleteMany({ where: { authorId: TARGET_USER_ID } });
    await tx.ticketAttachment.deleteMany({
      where: { uploadedById: TARGET_USER_ID },
    });
    await tx.ticketActivity.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.ticket.deleteMany({ where: { createdById: TARGET_USER_ID } });

    await tx.notification.deleteMany({
      where: { createdById: TARGET_USER_ID },
    });

    await tx.board.deleteMany({ where: { createdById: TARGET_USER_ID } });

    await tx.cardComment.deleteMany({ where: { authorId: TARGET_USER_ID } });
    await tx.cardActivity.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.card.deleteMany({ where: { createdById: TARGET_USER_ID } });

    await tx.chatMessage.deleteMany({ where: { senderId: TARGET_USER_ID } });
    await tx.messageReaction.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.messageMention.deleteMany({ where: { userId: TARGET_USER_ID } });

    // --- Phase 3: Delete user-owned records (direct userId relation) ---
    await tx.userRole.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.emergencyContact.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.education.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.experience.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.document.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.bankDetails.deleteMany({ where: { userId: TARGET_USER_ID } });

    const attendances = await tx.attendance.findMany({
      where: { userId: TARGET_USER_ID },
      select: { id: true },
    });
    const attendanceIds = attendances.map((a) => a.id);
    if (attendanceIds.length > 0) {
      await tx.break.deleteMany({
        where: { attendanceId: { in: attendanceIds } },
      });
    }
    await tx.attendance.deleteMany({ where: { userId: TARGET_USER_ID } });

    await tx.leave.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.task.deleteMany({ where: { assignedTo: TARGET_USER_ID } });
    await tx.skill.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.performance.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.projectAssignment.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.notificationRecipient.deleteMany({
      where: { userId: TARGET_USER_ID },
    });
    await tx.chatParticipant.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.userLastSeen.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.meeting.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.boardMember.deleteMany({ where: { userId: TARGET_USER_ID } });
    await tx.boardStar.deleteMany({ where: { userId: TARGET_USER_ID } });

    // --- Phase 4: Delete the user ---
    await tx.user.delete({ where: { id: TARGET_USER_ID } });
  });

  console.log("User and all related data deleted successfully.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
