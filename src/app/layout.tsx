import './globals.css'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/components/SupabaseProvider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
