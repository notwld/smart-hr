"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

interface PermissionGuardProps {
  permissions?: string | string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions.
 * 
 * @param permissions - The permission(s) required to render the children
 * @param requireAll - If true, all permissions must be present. If false, any permission is sufficient.
 * @param children - The content to render if the user has the required permissions
 * @param fallback - Optional content to render if the user doesn't have the required permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  // If no permissions are specified, render the children
  if (!permissions || (Array.isArray(permissions) && permissions.length === 0)) {
    return <>{children}</>;
  }

  // If still loading permissions, render nothing
  if (isLoading) {
    return null;
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

  return <>{fallback}</>;
};

export default PermissionGuard; 