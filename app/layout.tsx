import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './provider'
import ClientLayout from './client-layout'

export const metadata: Metadata = {
  title: 'Mize Technologies Portal',
  description: '',
  generator: '',
  robots: {
    index: false,
    follow: false,
  },
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
          <Providers>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Providers>
        </div>
      </body>
    </html>
  )
}