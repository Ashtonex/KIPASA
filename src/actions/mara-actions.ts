"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addMaraEntry(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const quantity = parseInt(formData.get("quantity") as string)
    const unit_buy_price = parseFloat(formData.get("unit_buy_price") as string)
    const target_sell_price = parseFloat(formData.get("target_sell_price") as string)
    const current_market_value = parseFloat(formData.get("current_market_value") as string) || 0

    // Parse the dynamic costs from the form
    // We expect inputs like "cost_name_0", "cost_value_0", etc.
    const additional_costs = []
    let i = 0
    while (formData.get(`cost_name_${i}`)) {
        additional_costs.push({
            name: formData.get(`cost_name_${i}`),
            value: parseFloat(formData.get(`cost_value_${i}`) as string) || 0
        })
        i++
    }

    if (!name || !quantity) return { error: "Missing required fields" }

    // We set total_misc_fees to 0 initially as we use the JSONB column now, 
    // but we keep the column for backward compatibility if needed.
    const { error } = await supabase
        .from("mara_valuations")
        .insert({
            item_name: name,
            quantity,
            unit_buy_price,
            target_sell_price,
            current_market_value,
            additional_costs: JSON.stringify(additional_costs),
            total_misc_fees: 0
        })

    if (error) {
        console.error("Mara Entry Error:", error)
        return { error: "Failed to log valuation" }
    }

    revalidatePath("/admin/mara-go")
    return { success: true }
}

export async function deleteMaraEntry(id: string) {
    const supabase = await createClient()
    await supabase.from("mara_valuations").delete().eq("id", id)
    revalidatePath("/admin/mara-go")
}

export async function getMaraValuations() {
    const supabase = await createClient()
    const { data } = await supabase.from("mara_valuations").select("*").order("created_at", { ascending: false })
    return data || []
}