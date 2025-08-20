"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page after short delay
    const timeout = setTimeout(() => {
      router.push("/");
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <PermissionGuard 
      permissions="dashboard.view"
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view the dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-4">This page is under construction. Redirecting to home page...</p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out]"></div>
        </div>
      </div>
    </PermissionGuard>
  );
}

// Add this to your global.css or as inline styles
const styles = `
@keyframes progress {
  0% { width: 0% }
  100% { width: 100% }
}
`; 