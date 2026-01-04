import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Block these paths from Google Search
      disallow: [
        "/admin/",
        "/account/",
        "/checkout/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}