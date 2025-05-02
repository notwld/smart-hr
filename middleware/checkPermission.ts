import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasPermission } from "@/lib/permissions";

/**
 * Middleware to check if a user has the required permission for an API route
 * @param handler The API route handler
 * @param permission The required permission
 */
export function withPermission(
  handler: Function,
  permission: string
) {
  return async (req: Request, context: any) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const hasAccess = await hasPermission(session.user.id, permission);

      if (!hasAccess) {
        return NextResponse.json(
          { message: `Forbidden: Missing required permission: ${permission}` },
          { status: 403 }
        );
      }

      return handler(req, context);
    } catch (error) {
      console.error(`Error checking permission ${permission}:`, error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to check if a user has any of the required permissions for an API route
 * @param handler The API route handler
 * @param permissions Array of permissions, any of which grants access
 */
export function withAnyPermission(
  handler: Function,
  permissions: string[]
) {
  return async (req: Request, context: any) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      let hasAccess = false;
      
      for (const permission of permissions) {
        if (await hasPermission(session.user.id, permission)) {
          hasAccess = true;
          break;
        }
      }

      if (!hasAccess) {
        return NextResponse.json(
          { message: "Forbidden: You don't have the required permissions for this action" },
          { status: 403 }
        );
      }

      return handler(req, context);
    } catch (error) {
      console.error("Error checking permissions:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
} 