"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function RecoveryNudge() {
    const { items: cartItems } = useCart()
    const [isVisible, setIsVisible] = useState(false)
    const [hasDismissed, setHasDismissed] = useState(false)

    useEffect(() => {
        // Show nudge if cart is not empty and not already dismissed this session
        if (cartItems.length > 0 && !hasDismissed) {
            const timer = setTimeout(() => setIsVisible(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [cartItems.length, hasDismissed])

    if (cartItems.length === 0) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg"
                >
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 bg-indigo-500/20 blur-3xl rounded-full" />

                        <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                            <ShoppingCart className="h-6 w-6 text-indigo-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-0.5">Don't miss out, sir</p>
                            <p className="text-sm font-bold text-white leading-tight truncate">
                                Items are still waiting in your cart.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-4 font-black uppercase tracking-tighter text-[11px]">
                                <Link href="/checkout">
                                    Checkout <ArrowRight className="ml-2 h-3 w-3" />
                                </Link>
                            </Button>
                            <button
                                onClick={() => {
                                    setIsVisible(false)
                                    setHasDismissed(true)
                                }}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
