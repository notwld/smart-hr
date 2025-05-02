import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  console.log("Middleware token:", token);
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Check if user is authenticated
    if (!token) {
      console.log("No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get the user ID from the token
    const userId = token.id as string;
    
    try {
      // Check if user has ADMIN role (either legacy or via new system)
      if (token.role === "ADMIN") {
        console.log("Admin access granted based on role in token");
        return NextResponse.next();
      }
      
      // Double-check user's roles in the database as a fallback
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
      
      console.log(`Found ${userRoles.length} roles for user:`, 
        userRoles.map(ur => ur.role.name));
      
      // Check if the user has Admin role
      const isAdmin = userRoles.some(userRole => userRole.role.name === "Admin");
      
      if (isAdmin) {
        console.log("Admin access granted based on Admin role");
        return NextResponse.next();
      }
      
      // For now, allow access to all authenticated users since the permissions system
      // has been set up properly with the API endpoints
      console.log("Access granted to authenticated user (temporary override)");
      return NextResponse.next();
      
      // In the future, uncomment and modify this code to enforce proper permissions
      /*
      // Extract unique permission names from all roles
      const userPermissions = new Set<string>();
      
      userRoles.forEach((userRole) => {
        userRole.role.permissions.forEach((rolePermission) => {
          userPermissions.add(rolePermission.permission.name);
        });
      });
      
      // Check permissions based on route
      if (path.includes("/admin/roles") && !userPermissions.has("roles.view")) {
        console.log("Access denied - missing roles.view permission");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      if (path.includes("/admin/permissions") && !userPermissions.has("roles.view")) {
        console.log("Access denied - missing roles.view permission");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // Allow access if we reach here
      console.log("Access granted based on permissions");
      return NextResponse.next();
      */
    } catch (error) {
      console.error("Error checking permissions:", error);
      // In case of error, fall back to allowing access for any authenticated user
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
}; 