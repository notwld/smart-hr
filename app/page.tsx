import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import DashboardContent from "@/components/dashboard/DashboardContent"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      attendance: {
        orderBy: { date: "desc" },
        take: 30,
      },
      leaves: {
        orderBy: { startDate: "desc" },
        take: 5,
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      skills: true,
      performance: {
        orderBy: { year: "desc", month: "desc" },
        take: 6,
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return <DashboardContent user={user} />
}
