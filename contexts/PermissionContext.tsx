"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface PermissionContextType {
  userPermissions: string[];
  userRoles: string[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refetchPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${session.user.id}/permissions`);
        
        if (response.ok) {
          const data = await response.json();
          setUserPermissions(data.permissions || []);
          setUserRoles(data.roles || []);
        } else {
          console.error("Failed to fetch user permissions");
          setUserPermissions([]);
          setUserRoles([]);
        }
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        setUserPermissions([]);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
      }
    } else if (status === "unauthenticated") {
      setUserPermissions([]);
      setUserRoles([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [session, status]);

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const refetchPermissions = async (): Promise<void> => {
    await fetchPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        userPermissions,
        userRoles,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

export default PermissionContext; 