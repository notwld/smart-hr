"use client"

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Routes that should not show the sidebar (full-screen experiences)
  const noSidebarRoutes = ['/onboarding', '/login', '/register']
  const shouldShowSidebar = session && !noSidebarRoutes.includes(pathname)

  // Don't show sidebar while loading
  if (status === 'loading') {
    return <div className="w-full">{children}</div>
  }

  // Show sidebar conditionally based on route and authentication
  return (
    <>
      {shouldShowSidebar && <Sidebar />}
      <div className={shouldShowSidebar ? "flex-1 overflow-auto" : "w-full"}>
        {children}
      </div>
    </>
  )
}
