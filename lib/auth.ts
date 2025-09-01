import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";

/**
 * Helper function to check if a user has admin permissions
 * Can be used in API routes to protect admin-only endpoints
 */
export async function isUserAdmin(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { message: "Unauthorized - Not authenticated" },
          { status: 401 }
        )
      };
    }
    
    // First, check if role is defined in the session
    const userRole = session.user.role;
    if (userRole === "ADMIN") {
      // User is already verified as admin in the session
      return { isAdmin: true };
    }
    
    // Fallback: Check the database directly
    const userId = session.user.id;
    
    // Check if user has admin role in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        legacyRole: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { message: "Unauthorized - User not found" },
          { status: 401 }
        )
      };
    }
    
    const isAdmin = 
      user.legacyRole === "ADMIN" || 
      user.userRoles.some(ur => ur.role.name === "Admin");
    
    if (!isAdmin) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { message: "Unauthorized - Admin access required" },
          { status: 401 }
        )
      };
    }

    return { isAdmin: true };

  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return {
      isAdmin: false,
      response: NextResponse.json(
        { message: "Error checking admin permissions" },
        { status: 500 }
      )
    };
  }
}
