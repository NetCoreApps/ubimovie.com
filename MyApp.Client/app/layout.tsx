import "../styles/index.css"
import "../styles/main.css"
import "../styles/prism-dark-blue.css"
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Next.js Example',
  description: 'Next.js App Router Example',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full dark">
      <head />
      <body className="h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
