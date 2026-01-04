import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package2, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Shop by Category | Kipasa Store",
  description: "Browse our wide range of collections from Tactical Wear to Zimbo Wear.",
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch all categories sorted alphabetically
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    // --- FIX: ADDED 'w-full max-w-7xl mx-auto px-4' TO CENTER CONTENT ---
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-10">
      
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Our Collections
        </h1>
        <p className="mt-4 text-muted-foreground">
          Explore our diverse range of products tailored for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories?.map((category) => (
          <Link 
            key={category.id} 
            href={`/products?category=${category.slug}`}
            className="group"
          >
            <Card className="h-full transition-all hover:border-primary hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold line-clamp-1">
                  {category.name}
                </CardTitle>
                {/* Icon Placeholder */}
                <Package2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Browse Products <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State Fallback */}
      {(!categories || categories.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No categories found.</p>
        </div>
      )}
    </div>
  )
}