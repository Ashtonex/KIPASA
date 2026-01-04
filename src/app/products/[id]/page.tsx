import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import { AddToCartButton } from "@/components/feature/AddToCartButton"
import { WishlistButton } from "@/components/feature/WishlistButton"
import { ProductCard } from "@/components/feature/ProductCard"
import { ProductReviews } from "@/components/feature/ProductReviews"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Package 
} from "lucide-react"

// --- 1. Dynamic SEO Metadata (Updated for Next.js 15) ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const resolvedParams = await params // THE FIX: Await params

  const { data: product } = await supabase
    .from("products")
    .select("name, description, images")
    .eq("id", resolvedParams.id)
    .single()

  if (!product) return { title: "Product Not Found" }

  const imageUrl = product.images?.[0] || "/placeholder.png"

  return {
    title: `${product.name} | Kipasa Store`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} in Zimbabwe.`,
    openGraph: {
      title: product.name,
      description: product.description || "Best prices at Kipasa Store",
      images: [imageUrl],
    },
  }
}

// --- 2. Main Page Component (Updated for Next.js 15) ---
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await params // THE FIX: Await params

  // A. Fetch Product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (!product) notFound()

  // B. Fetch Reviews & Current User
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", resolvedParams.id)
    .order("created_at", { ascending: false })

  // C. Fetch Related Products (Cross-selling)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4)

  const imageUrl = product.images?.[0] || "/placeholder.png"
  const isOutOfStock = product.stock <= 0

  return (
    <div className="container mx-auto py-10 md:py-16 space-y-16 px-4">
      
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-primary">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      {/* TOP SECTION: Details & Image */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        
        {/* Left: Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted shadow-sm">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-4 right-4 z-10">
             <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                <WishlistButton productId={product.id} />
             </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Badge variant="outline" className="capitalize">{product.category}</Badge>
               {isOutOfStock ? (
                 <Badge variant="destructive">Out of Stock</Badge>
               ) : (
                 <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">In Stock</Badge>
               )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
             <h3 className="font-semibold text-lg">Description</h3>
             <p className="text-muted-foreground leading-relaxed">
               {product.description || "No description available for this product."}
             </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-6">
             <div className="flex-1 max-w-xs">
                <AddToCartButton product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: imageUrl,
                    quantity: 1
                }} />
             </div>
             
             <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center"><CheckCircle2 className="mr-2 h-3 w-3 text-green-600"/> Secure Checkout</p>
                <p className="flex items-center"><Package className="mr-2 h-3 w-3 text-green-600"/> Mutare Local Delivery</p>
             </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/20 text-sm">
             <div className="flex gap-3">
               <Truck className="h-5 w-5 text-primary" />
               <div>
                 <p className="font-medium">Fast Shipping</p>
                 <p className="text-xs text-muted-foreground">Nationwide delivery</p>
               </div>
             </div>
             <div className="flex gap-3">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <div>
                 <p className="font-medium">100% Genuine</p>
                 <p className="text-xs text-muted-foreground">Quality Guaranteed</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <ProductReviews 
        productId={resolvedParams.id} 
        reviews={reviews || []} 
        userId={user?.id} 
      />

      {/* RELATED PRODUCTS SECTION (Added for cross-selling) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-8 pt-10 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
            <Link href={`/products?category=${product.category}`} className="text-primary text-sm font-medium hover:underline">
              View all {product.category}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}