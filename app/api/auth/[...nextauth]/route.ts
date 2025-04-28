import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";

// Helper: Fetch full user data after login
async function getFullUserData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
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

  return {
    ...user,
    attendance,
    leaves,
    tasks,
    skills,
    performance,
  };
}

// Your NextAuth configuration
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Fetch user
        const userWithData = await getFullUserData(credentials.email);

        if (!userWithData) {
          return null;
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, userWithData.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: userWithData.id,
          email: userWithData.email,
          name: userWithData.username,
          role: userWithData.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
