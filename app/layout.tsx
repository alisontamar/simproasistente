import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Simpro asistente',
  description: 'Grupo1',
  generator: 'GRUPO1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Analytics/>
      <body>{children}</body>
    </html>
  )
}
