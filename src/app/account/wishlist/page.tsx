import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/feature/ProductCard" // Reuse your existing card!
import { Heart } from "lucide-react"

export const metadata = { title: "My Wishlist" }

export default async function WishlistPage() {
  const supabase = await createClient()

  // Fetch wishlist items + product details
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select(`
      id,
      products (*)
    `)
    .order("created_at", { ascending: false })

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10">
        <Heart className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-4">Save items you want to buy later.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item: any) => (
           // We reuse ProductCard, passing the product data inside the wishlist item
           <ProductCard key={item.id} product={item.products} />
        ))}
      </div>
    </div>
  )
}