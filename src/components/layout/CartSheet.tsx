"use client"

import { useCart } from "@/context/CartContext"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Plus, Minus, PackageSearch } from "lucide-react"
import Link from "next/link"

export function CartSheet() {
  // FIX: Destructure 'cartCount' instead of 'totalItems' to match CartContextType
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount, isCartOpen, setCartOpen } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      
      {/* Trigger Button */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-xl transition-all">
          <ShoppingCart className="h-5 w-5 text-slate-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white animate-in zoom-in shadow-sm">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg border-l-none shadow-2xl rounded-l-[2rem]">
        <SheetHeader className="px-6 py-4 border-b border-slate-50">
          <SheetTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-blue-600" />
            Cart_Manifest ({cartCount})
          </SheetTitle>
        </SheetHeader>
        
        {/* Cart Items List - Using standard scrollable div to fix ScrollArea build error */}
        <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <div className="bg-slate-50 p-6 rounded-full">
                <ShoppingCart className="h-12 w-12 text-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Empty_Payload</p>
                <Button variant="link" onClick={() => setCartOpen(false)} className="text-blue-600 font-bold">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Image Asset */}
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                    {item.image ? (
                        <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-black uppercase text-slate-300">No_Img</div>
                    )}
                  </div>

                  {/* Details Node */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-sm">{item.name}</h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Totals & Finalize */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-slate-50 p-6 bg-slate-50/30">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total_Valuation</span>
                <span className="text-xl font-black tracking-tighter text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl shadow-xl shadow-slate-200" asChild>
                <Link href="/checkout" onClick={() => setCartOpen(false)}>
                  Proceed to Checkout Node
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}