import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { HtmlWrapper } from "@/components/html-wrapper"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "Video Stack.AI",
  description: "AI-powered video creation platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <HtmlWrapper>
          <AuthProvider>
            <Suspense fallback={null}>
              {children}
              <Analytics />
            </Suspense>
          </AuthProvider>
        </HtmlWrapper>
      </body>
    </html>
  )
}
