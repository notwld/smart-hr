import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
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
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    legacyRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    legacyRole?: string;
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

        // Check if user account is active
        if (user.status !== "ACTIVE") {
          throw new Error(`Your account is ${user.status.toLowerCase()}. Please contact an administrator.`);
        }

        // Check if user has Admin role in the new role system
        const hasAdminRole = user.userRoles?.some(ur => ur.role.name === "Admin");
        
        // Check if the user has the legacy ADMIN role
        const isLegacyAdmin = user.legacyRole === "ADMIN";
        
        // Determine the effective role
        const effectiveRole = isLegacyAdmin || hasAdminRole ? "ADMIN" : user.legacyRole || "EMPLOYEE";

        console.log("User authenticated:", {
          id: user.id,
          email: user.email,
          legacyRole: user.legacyRole,
          userRoles: user.userRoles?.map(ur => ur.role.name),
          effectiveRole
        });

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: effectiveRole,
          legacyRole: user.legacyRole
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        console.log("JWT callback with user:", user);
        token.id = user.id;
        token.role = user.role;
        token.legacyRole = user.legacyRole;
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
      
      console.log("JWT callback returning token:", token);
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.legacyRole = token.legacyRole as string;
        
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
          } else {
            session.user.role = "EMPLOYEE"; // Default fallback
          }
        }
        
        console.log("Session callback returning:", session);
      }
      return session;
    },
  },
}; 