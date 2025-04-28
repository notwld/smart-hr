import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/sidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route' // Adjust the path as necessary

export const metadata: Metadata = {
  title: 'smart portal',
  description: '',
  generator: '',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-[#f8f9fa]">
          {session ? <Sidebar /> : null} 
          {children}
        </div>
      </body>
    </html>
  )
}