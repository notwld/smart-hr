import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      legacyRole?: string;
      onboardingCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    legacyRole?: string;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    legacyRole?: string;
    onboardingCompleted?: boolean;
  }
}

// Fetch user
async function getFullUserData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  return user;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await getFullUserData(credentials.email);

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Check if user has Admin role in the new role system
        const hasAdminRole = user.userRoles?.some(ur => ur.role.name === "Admin");
        
        // Check if the user has the legacy ADMIN role
        const isLegacyAdmin = user.legacyRole === "ADMIN";
        
        // Determine the effective role
        const effectiveRole = isLegacyAdmin || hasAdminRole ? "ADMIN" : user.legacyRole || "EMPLOYEE";

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: effectiveRole,
          legacyRole: user.legacyRole,
          onboardingCompleted: user.onboardingCompleted
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.legacyRole = user.legacyRole;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      
      // If the user record was updated, we might need to refresh the token
      if (trigger === "update") {
        // You could fetch the latest user data here if needed
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        });
        
        if (updatedUser) {
          const hasAdminRole = updatedUser.userRoles?.some(ur => ur.role.name === "Admin");
          const isLegacyAdmin = updatedUser.legacyRole === "ADMIN";
          token.role = isLegacyAdmin || hasAdminRole ? "ADMIN" : updatedUser.legacyRole || "EMPLOYEE";
          token.legacyRole = updatedUser.legacyRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.legacyRole = token.legacyRole as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        
        // Ensure the role is never undefined
        if (!session.user.role) {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              userRoles: {
                include: {
                  role: true
                }
              }
            }
          });
          
          if (user) {
            const hasAdminRole = user.userRoles?.some(ur => ur.role.name === "Admin");
            const isLegacyAdmin = user.legacyRole === "ADMIN";
            session.user.role = isLegacyAdmin || hasAdminRole ? "ADMIN" : user.legacyRole || "EMPLOYEE";
            session.user.onboardingCompleted = user.onboardingCompleted;
          } else {
            session.user.role = "EMPLOYEE"; // Default fallback
            session.user.onboardingCompleted = false;
          }
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };