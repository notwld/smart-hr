"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">This page is under construction. Redirecting to home page...</p>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out]"></div>
      </div>
    </div>
  );
}

// Add this to your global.css or as inline styles
const styles = `
@keyframes progress {
  0% { width: 0% }
  100% { width: 100% }
}
`; 