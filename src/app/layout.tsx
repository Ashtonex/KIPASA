import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/context/CartContext"
import { Toaster } from "sonner" // Ensure you have installed sonner: npm install sonner
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
}

export const metadata: Metadata = {
  metadataBase: new URL('https://blackwell-black.vercel.app'),
  title: "Kipasa Store | Best Deals Online",
  description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
  openGraph: {
    title: "Kipasa Store | Best Deals Online",
    description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
    url: "https://blackwell-black.vercel.app",
    siteName: "Kipasa Store",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kipasa Store - Quality Gear and Gifts",
      },
    ],
    locale: "en_ZW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kipasa Store | Best Deals Online",
    description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* 1. Provider wraps the entire UI */}
        <CartProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />

            {/* 2. Global Toast Notifications */}
            <Toaster richColors position="top-right" closeButton />
          </div>
        </CartProvider>

        {/* 3. Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}