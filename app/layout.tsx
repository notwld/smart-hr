import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/sidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route' // Adjust the path as necessary
import { Providers } from './provider'

export const metadata: Metadata = {
  title: 'Mize Technologies Portal',
  description: '',
  generator: '',
  robots: {
    index: false,
    follow: false,
  },
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
          <Providers>
          {session ? <Sidebar /> : null} 
          {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}