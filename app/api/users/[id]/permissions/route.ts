import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getUserPermissions, getUserRoles } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Permissions API called for user ID:", params.id);
    const session = await getServerSession(authOptions);
    console.log("Session in permissions API:", session);

    if (!session?.user?.id) {
      console.log("No session found, returning 401");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Users can fetch their own permissions, or admins can fetch anyone's permissions
    if (session.user.id !== params.id) {
      // Check if the current user is an admin
      const isAdmin = await prisma.userRole.findFirst({
        where: {
          userId: session.user.id,
          role: {
            name: "Admin"
          }
        },
      });
      
      console.log("Admin check result:", isAdmin);
      
      if (!isAdmin) {
        console.log("User is not an admin and trying to access another user's permissions");
        return NextResponse.json(
          { message: "Forbidden: You don't have permission to access this resource" },
          { status: 403 }
        );
      }
    }

    // Get user permissions
    const permissions = await getUserPermissions(params.id);
    console.log("Retrieved permissions:", permissions);
    
    // Get user roles
    const roles = await getUserRoles(params.id);
    // Use type assertion to avoid TypeScript errors since we know the shape of the data
    const roleNames = roles.map((role: any) => role.name);
    console.log("Retrieved roles:", roleNames);

    return NextResponse.json({
      userId: params.id,
      permissions,
      roles: roleNames,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { message: "Error fetching user permissions" },
      { status: 500 }
    );
  }
} 