"use client"

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import SkeletonSidebar from '@/components/SkeletonSidebar'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Routes that should not show the sidebar (full-screen experiences)
  const noSidebarRoutes = ['/onboarding', '/login', '/register']
  const isNoSidebarRoute = noSidebarRoutes.includes(pathname)
  const shouldShowSidebar = session && !isNoSidebarRoute
  const shouldShowSkeletonSidebar = status === 'loading' && !isNoSidebarRoute

  // Show skeleton sidebar during loading (except on full-screen routes)
  if (shouldShowSkeletonSidebar) {
    return (
      <>
        <SkeletonSidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </>
    )
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
