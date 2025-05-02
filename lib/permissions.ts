import { prisma } from "./prisma";

// Fetch all permissions for a user
export async function getUserPermissions(userId: string): Promise<string[]> {
  console.log("getUserPermissions called for user ID:", userId);
  
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
  
  console.log("User roles retrieved:", userRoles.length);

  // Extract unique permission names from all roles
  const permissionSet = new Set<string>();
  
  userRoles.forEach((userRole) => {
    console.log(`Processing role: ${userRole.role.name}, has ${userRole.role.permissions.length} permissions`);
    userRole.role.permissions.forEach((rolePermission) => {
      permissionSet.add(rolePermission.permission.name);
    });
  });

  const permissions = Array.from(permissionSet);
  console.log("Final permissions list:", permissions);
  return permissions;
}

// Check if a user has a specific permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  const result = permissions.includes(permission);
  console.log(`hasPermission check for ${userId} - ${permission}: ${result}`);
  return result;
}

// Check if a user has all of the specified permissions
export async function hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissions.every((permission) => userPermissions.includes(permission));
}

// Check if a user has any of the specified permissions
export async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissions.some((permission) => userPermissions.includes(permission));
}

// Middleware to check permission for API routes
export async function checkPermission(userId: string, permission: string) {
  const hasAccess = await hasPermission(userId, permission);
  
  if (!hasAccess) {
    throw new Error(`Access denied: Missing permission "${permission}"`);
  }
  
  return true;
}

// Utility to get roles for a user
export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: true,
    },
  });
  
  return userRoles.map(ur => ur.role);
}

// Format: resource.action (e.g., users.view, leaves.approve)
export function createPermissionName(resource: string, action: string): string {
  return `${resource}.${action}`;
} 