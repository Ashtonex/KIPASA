"use client"

import Link from "next/link"
import { ShoppingCart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

export function CartButton() {
  // FIX: Destructure 'cartCount' to match the CartContext definition
  const { cartCount, isCartOpen } = useCart()

  return (
    <Link href="/cart" className="group">
      <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-xl transition-all">
        <ShoppingCart className="h-5 w-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
        
        {/* Badge Engine: Only renders if count > 0 */}
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white animate-in zoom-in duration-300 shadow-sm">
            {cartCount}
          </span>
        )}

        {/* Visual Pulse: Active when cart is open or items are being added */}
        {cartCount > 0 && (
          <Activity className="absolute -bottom-1 -right-1 h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
        )}
      </Button>
    </Link>
  )
}