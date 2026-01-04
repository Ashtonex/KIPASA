"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client" // Use Client SDK
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // 1. Check status on mount
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .single()

      setIsWishlisted(!!data)
      setLoading(false)
    }
    checkStatus()
  }, [productId, supabase])

  // 2. Toggle Handler
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent clicking the parent Product Card link
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/login")
      return
    }

    // Optimistic Update (Update UI immediately)
    const previousState = isWishlisted
    setIsWishlisted(!previousState)

    if (previousState) {
      // Remove
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id)
      
      if (error) setIsWishlisted(previousState) // Revert on error
    } else {
      // Add
      const { error } = await supabase
        .from("wishlist")
        .insert({ product_id: productId, user_id: user.id })
      
      if (error) setIsWishlisted(previousState) // Revert on error
    }
    
    // Refresh router to update any server components listening to data
    router.refresh()
  }

  if (loading) return null // Or a small spinner

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleWishlist}
      className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm hover:text-red-600 transition-colors backdrop-blur-sm"
    >
      <Heart
        className={cn("h-5 w-5 transition-all", isWishlisted ? "fill-red-600 text-red-600" : "text-muted-foreground")}
      />
      <span className="sr-only">Add to Wishlist</span>
    </Button>
  )
}