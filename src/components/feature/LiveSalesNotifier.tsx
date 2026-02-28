"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { ShoppingBag, X } from "lucide-react"
import { animate, motion, AnimatePresence } from "framer-motion"

export function LiveSalesNotifier() {
    const [lastOrder, setLastOrder] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchLatestOrder = async () => {
            const { data } = await supabase
                .from("orders")
                .select("id, first_name, shipping_city, order_items(products(name))")
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

            if (data) {
                setLastOrder(data)
                setIsVisible(true)
                // Hide after 5 seconds
                setTimeout(() => setIsVisible(false), 5000)
            }
        }

        // Initial fetch
        fetchLatestOrder()

        // Real-time subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    fetchLatestOrder()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (!lastOrder) return null

    const productName = lastOrder.order_items?.[0]?.products?.name || "a product"
    const city = lastOrder.shipping_city || "Zimbabwe"

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bottom-6 left-6 z-[100] max-w-sm w-full pointer-events-none md:pointer-events-auto"
                >
                    <Card className="bg-white/95 backdrop-blur-md border-slate-100 shadow-2xl p-4 flex items-center gap-4 rounded-2xl ring-1 ring-slate-900/5">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">Live Kipasa Feed</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {lastOrder.first_name || "Someone"} in <span className="text-indigo-600">{city}</span> just purchased {productName}!
                            </p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
