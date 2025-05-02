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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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
      
      if (!isAdmin) {
        return NextResponse.json(
          { message: "Forbidden: You don't have permission to access this resource" },
          { status: 403 }
        );
      }
    }

    // Get user permissions
    const permissions = await getUserPermissions(params.id);
    
    // Get user roles
    const roles = await getUserRoles(params.id);
    // Use type assertion to avoid TypeScript errors since we know the shape of the data
    const roleNames = roles.map((role: any) => role.name);

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