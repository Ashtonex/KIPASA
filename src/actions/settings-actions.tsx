"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateShippingMethod(id: string, price: number, active: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("shipping_methods")
        .update({
            price,
            active // Ensure your DB has an 'active' boolean column, or remove this if not
        })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/settings")
    return { success: true }
}

export async function toggleStoreStatus(isOpen: boolean) {
    // This would typically update a 'config' table
    // For now, we'll simulate a success to show the UI interaction
    return { success: true }
}