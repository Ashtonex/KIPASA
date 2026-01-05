import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/context/CartContext"
import { Toaster } from "@/components/ui/sonner" 
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
  themeColor: "#2563eb", 
}

// AMENDED: Added Open Graph and Twitter metadata for rich sharing previews
export const metadata: Metadata = {
  metadataBase: new URL('https://blackwell-black.vercel.app'), // Required for absolute image paths
  title: "Kipasa Store | Best Deals Online",
  description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
  openGraph: {
    title: "Kipasa Store | Best Deals Online",
    description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
    url: "https://blackwell-black.vercel.app",
    siteName: "Kipasa Store",
    images: [
      {
        url: "/og-image.png", // Ensure this exists in your /public folder
        width: 1200,
        height: 630,
        alt: "Kipasa Store - Quality Gear and Gifts",
      },
    ],
    locale: "en_ZW", // Set to Zimbabwe locale
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kipasa Store | Best Deals Online",
    description: "Shop the best products at Kipasa Store. Fast delivery in Zimbabwe.",
    images: ["/og-image.png"], // Same image used for Twitter
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
        <SpeedInsights />
      </body>
    </html>
  )
}