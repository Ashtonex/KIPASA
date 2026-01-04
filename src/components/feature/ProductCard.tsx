"use client"

import { useState } from "react" // Added for form state management
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Flame, AlertCircle, Ban, BellRing, CheckCircle2, Mail } from "lucide-react" 
import { useCart } from "@/context/CartContext"
import { WishlistButton } from "./WishlistButton"
import { registerStockInterest } from "@/actions/notification-actions" // Create this action

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart()
  
  // --- Form States ---
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const imageUrl = product.images?.[0] || "/placeholder.png"
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock < 5

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    const result = await registerStockInterest(product.id, email)
    setIsSubmitting(false)
    
    if (result.success) {
      setIsSubscribed(true)
      setEmail("")
    } else {
      alert(result.message)
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl flex flex-col h-full border-gray-100 rounded-2xl">
      
      {/* 1. Clickable Image Area with Sold Out Overlay */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 block">
        <div className={`relative h-full w-full transition-all duration-500 ${isOutOfStock ? "grayscale contrast-75" : "group-hover:scale-110"}`}>
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
               <div className="bg-white/90 text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-xl transform -rotate-12">
                  <Ban className="h-4 w-4" />
                  <span className="text-sm font-black uppercase tracking-tighter">Sold Out</span>
               </div>
            </div>
          )}
        </div>

        {/* --- DYNAMIC BADGES --- */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
          {isLowStock && !isOutOfStock && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-2 py-1 flex items-center gap-1 shadow-md animate-pulse">
              <AlertCircle className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Only {product.stock} Left</span>
            </Badge>
          ) || product.is_flash_deal && !isOutOfStock && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-none px-2 py-1 flex items-center gap-1 shadow-lg">
              <Flame className="h-3 w-3 fill-white" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Flash Sale</span>
            </Badge>
          )}
        </div>

        {!isOutOfStock && (
          <div className="absolute top-3 right-3 z-30 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
             <WishlistButton productId={product.id} />
          </div>
        )}
      </Link>

      {/* 2. Content Details */}
      <CardContent className={`p-4 flex-1 flex flex-col gap-1 ${isOutOfStock ? "opacity-50" : ""}`}>
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{product.category}</p>
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-gray-900 leading-tight hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
            </div>
        </div>
        
        <div className="mt-auto pt-3 flex items-baseline gap-2">
            <p className={`text-xl font-black tracking-tighter ${isOutOfStock ? "text-gray-400" : "text-gray-900"}`}>
                ${Number(product.price).toFixed(2)}
            </p>
        </div>
      </CardContent>

      {/* 3. Footer Action: Toggle between Cart and Notify Me */}
      <CardFooter className="p-4 pt-0">
        {!isOutOfStock ? (
          <Button 
            className="w-full font-black uppercase tracking-tighter h-11 rounded-xl shadow-lg transition-all bg-black text-white hover:bg-gray-800"
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: imageUrl,
              quantity: 1
            })}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        ) : isSubscribed ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-tighter">On the list!</span>
          </div>
        ) : (
          <form onSubmit={handleNotifyMe} className="w-full space-y-2 animate-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="email"
                required
                placeholder="Email for restock alert"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none focus:border-black transition-colors"
              />
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting}
              variant="outline"
              className="w-full font-black uppercase tracking-tighter h-10 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all shadow-sm"
            >
              {isSubmitting ? "Processing..." : (
                <><BellRing className="mr-2 h-3.5 w-3.5" /> Notify Me</>
              )}
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  )
}