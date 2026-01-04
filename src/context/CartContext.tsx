"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void 
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setCartOpen] = useState(false) 
  const [isMounted, setIsMounted] = useState(false)

  // 1. Load cart from LocalStorage on mount (Client Only)
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
  }, [])

  // 2. Save to LocalStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isMounted])

  // Helper Functions
  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === newItem.id)
      if (existing) {
        return currentItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...currentItems, { ...newItem, quantity: 1 }]
    })
    setCartOpen(true) 
  }

  const removeFromCart = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  // Computed Values
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  // --- FIX IS HERE ---
  // We REMOVED the "if (!isMounted) return <>{children}</>" block.
  // We always return the Provider, but we can pass empty values if not mounted yet to be safe.
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        cartCount, 
        cartTotal,
        isCartOpen, 
        setCartOpen 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}