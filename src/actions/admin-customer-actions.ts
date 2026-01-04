"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCustomers() {
  const supabase = await createClient()

  // 1. Fetch profiles - removed 'created_at' to fix Error 42703
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*") 
    // If you don't have created_at, we sort by full_name or id instead
    .order("full_name", { ascending: true })

  if (pError) {
    console.error("Customer Engine (Profiles) Error:", pError)
    return []
  }

  // 2. Fetch all successful orders
  const { data: orders, error: oError } = await supabase
    .from("orders")
    .select("user_id, total_amount, status, created_at")
    .in("status", ["paid", "shipped", "delivered"])

  if (oError) {
    console.error("Customer Engine (Orders) Error:", oError)
    return profiles.map(p => ({ ...p, totalSpend: 0, orderCount: 0, lastOrderDate: null }))
  }

  // 3. Synthesis with Inactivity Logic
  return profiles.map((profile: any) => {
    const userOrders = orders.filter(order => order.user_id === profile.id)
    
    // Find the most recent order date
    const lastOrder = userOrders.length > 0 
      ? new Date(Math.max(...userOrders.map(o => new Date(o.created_at).getTime())))
      : null

    const totalSpend = userOrders.reduce((acc, order) => acc + (order.total_amount || 0), 0)

    return {
      id: profile.id,
      name: profile.full_name || "Anonymous_Node",
      email: profile.email,
      role: profile.role || 'user',
      city: profile.city || 'Origin_Unknown',
      totalSpend,
      orderCount: userOrders.length,
      lastOrderDate: lastOrder, // Used for the Pulse Status
    }
  })
}