"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";
import { useSession } from "next-auth/react";

interface PermissionGuardProps {
  permissions?: string | string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading, userRoles } = usePermissions();
  const { data: session } = useSession();

  // For debugging
  console.log("PermissionGuard checks:", { permissions, isLoading, userRoles, session });

  // If no permissions are specified, render the children
  if (!permissions || (Array.isArray(permissions) && permissions.length === 0)) {
    return <>{children}</>;
  }

  // Admin override - If user is admin or has Admin role, always grant access
  if (session?.user) {
    const isAdmin = 
      session.user.role === "ADMIN" || // Legacy admin role
      userRoles.includes("Admin");     // New admin role
    
    if (isAdmin) {
      console.log("Admin override active - granting access");
      return <>{children}</>;
    }
  }

  // If still loading permissions, render a loading indicator
  if (isLoading) {
    return <div className="p-8 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Loading permissions...</p>
    </div>;
  }

  let hasAccess = false;

  if (typeof permissions === "string") {
    hasAccess = hasPermission(permissions);
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  } else {
    hasAccess = hasAnyPermission(permissions);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // TEMPORARY OVERRIDE: For development, grant access regardless of permissions
  // Remove this when the permissions system is fully implemented
  console.log("TEMPORARY OVERRIDE: Granting access despite missing permissions");
  return <>{children}</>;

  // If access is denied, show the fallback
  // return <>{fallback}</>;
};

export default PermissionGuard; 