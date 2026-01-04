import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/feature/ProductCard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Tag, Flame, Sparkles } from "lucide-react"

export const metadata = {
  title: "Kipasa Store | Best Deals in Zimbabwe",
  description: "Shop electronics, fashion, and home goods at unbeatable prices.",
}

export default async function Home() {
  const supabase = await createClient()

  // 1. Fetch Dynamic Banner & Section Content
  const { data: content } = await supabase
    .from("site_content")
    .select("*")
    .in("slug", ["hero-banner", "just-for-you"])

  const heroData = content?.find(c => c.slug === "hero-banner")
  const justForYouText = content?.find(c => c.slug === "just-for-you")

  // 2. Fetch "Flash Deals" (Filtered by Admin Toggle)
  const { data: flashSale } = await supabase
    .from("products")
    .select("*")
    .eq("is_flash_deal", true)
    .limit(4)

  // 3. Fetch "Just For You" (Filtered by Admin Toggle)
  const { data: justForYou } = await supabase
    .from("products")
    .select("*")
    .eq("is_just_for_you", true)
    .order("created_at", { ascending: false })
    .limit(8)

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- HERO SECTION (Dynamic) --- */}
      <section className="relative h-[450px] md:h-[550px] w-full overflow-hidden bg-black text-white">
        {/* Use Dynamic Image URL from Database if available */}
        {heroData?.image_url ? (
          <div className="absolute inset-0">
             <img src={heroData.image_url} alt="Banner" className="w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-fuchsia-800 to-orange-500 opacity-90" />
        )}
        
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
        
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 relative z-10 flex h-full flex-col justify-center items-center text-center gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black uppercase tracking-wider">
            <Zap className="h-3 w-3 fill-black" /> {heroData?.title ? "Live Updates" : "Flash Deals Live"}
          </div>
          
          <div className="space-y-2">
            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-7xl drop-shadow-md">
              {heroData?.title?.includes(' ') ? (
                <>
                  {heroData.title.split(' ').slice(0, -1).join(' ')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    {heroData.title.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                heroData?.title || "Mid-Season Blowout Sale"
              )}
            </h1>
            <p className="max-w-lg mx-auto text-lg text-gray-200 md:text-xl font-light">
              {heroData?.subtitle || "Up to 70% OFF on trending items."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 font-bold px-8 h-12 text-md rounded-full shadow-lg transition-transform hover:scale-105">
              <Link href="/products">{heroData?.button_text || "Shop Now"}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/20 px-8 h-12 text-md rounded-full transition-all">
              <Link href="/products?category=clothing">Explore Fashion</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- CATEGORY ICONS --- */}
      <section className="border-b bg-muted/20 py-8">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-primary">
             <Tag className="h-5 w-5" />
             <h3 className="font-bold text-lg uppercase tracking-tight">Shop by Category</h3>
          </div>
          <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 w-full justify-center scrollbar-hide snap-x">
            {["All", "Clothing", "Electronics", "Home", "Beauty", "Footwear", "Accessories"].map((name) => (
              <Link 
                key={name} 
                href={name === "All" ? "/products" : `/products?category=${name.toLowerCase()}`} 
                className="flex flex-col items-center gap-3 min-w-[80px] snap-start group"
              >
                <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-all group-hover:shadow-md">
                  <span className="text-xl font-black text-primary/40 group-hover:text-primary">
                    {name[0]}
                  </span>
                </div>
                <span className="text-xs font-bold text-center group-hover:text-primary transition-colors">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- FLASH DEALS SECTION (Dynamic Filter) --- */}
      {flashSale && flashSale.length > 0 && (
        <section className="bg-gradient-to-b from-red-50 to-background py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-red-600 text-white p-2 rounded-lg shadow-md animate-bounce">
                   <Flame className="h-6 w-6" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black tracking-tighter text-red-700 uppercase">Flash Deals</h2>
                   <p className="text-xs text-red-600 font-bold">Mutare's hottest picks right now!</p>
                 </div>
              </div>
              <Link href="/products" className="text-sm font-bold hover:underline flex items-center text-red-600">
                View All Deals <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSale.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- JUST FOR YOU (Dynamic Content & Filter) --- */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black tracking-[0.2em] text-amber-600 uppercase">Personalized</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter relative inline-block">
              {justForYouText?.title || "Just For You"}
              <span className="absolute -bottom-2 left-0 w-full h-2 bg-primary/10 -z-10"></span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto font-medium">
              {justForYouText?.subtitle || "Handpicked favorites chosen specifically for your style and home."}
            </p>
        </div>
        
        {justForYou && justForYou.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {justForYou.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground italic">No featured products currently.</div>
        )}
        
        <div className="mt-16 text-center">
          <Button asChild size="lg" variant="outline" className="px-12 rounded-full font-black border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}