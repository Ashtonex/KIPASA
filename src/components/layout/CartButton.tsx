"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

export function CartButton() {
  const { totalItems } = useCart()

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        
        {/* Only show badge if we have items */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in">
            {totalItems}
          </span>
        )}
      </Button>
    </Link>
  )
}