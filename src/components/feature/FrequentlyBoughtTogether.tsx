"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductCard } from "./ProductCard"

export function FrequentlyBoughtTogether({ category, currentProductId }: { category: string, currentProductId: string }) {
    const [products, setProducts] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchRelated = async () => {
            const { data } = await supabase
                .from("products")
                .select("*")
                .eq("category", category)
                .neq("id", currentProductId)
                .limit(3)

            if (data) setProducts(data)
        }

        fetchRelated()
    }, [category, currentProductId])

    if (products.length === 0) return null

    return (
        <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    Frequently Bought Together
                </h2>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Personalized for you</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
