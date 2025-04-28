import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch base user first
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch related data separately
  const [attendance, leaves, tasks, skills, performance] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.leave.findMany({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { assignedTo: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.skill.findMany({
      where: { userId: user.id },
    }),
    prisma.performance.findMany({
      where: { userId: user.id },
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ],
      take: 6,
    }),
  ]);

  const fullUser = {
    ...user,
    attendance,
    leaves,
    tasks,
    skills,
    performance,
  };

  return <DashboardContent user={fullUser} />;
}
