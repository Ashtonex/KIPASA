import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next" // Added for performance monitoring
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/context/CartContext"
import { Toaster } from "@/components/ui/sonner" 
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kipasa Store | Best Deals Online",
  description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* CartProvider MUST wrap the div that contains the Navbar for context to be accessible */}
        <CartProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <Toaster richColors position="top-center" />
          </div>
        </CartProvider>

        <Analytics />
        <SpeedInsights /> {/* Integrated Speed Insights component */}
      </body>
    </html>
  )
}