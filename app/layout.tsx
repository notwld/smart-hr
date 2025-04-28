import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'smart portal',
  description: '',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-[#f8f9fa]">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  )
}
