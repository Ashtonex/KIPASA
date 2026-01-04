"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner" // Optional: if you use a toast library

export function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
    })
    // Simple alert if you don't have a toast library yet
    // alert("Added to cart!") 
  }

  return (
    <Button size="lg" className="w-full md:w-auto" onClick={handleAdd}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  )
}