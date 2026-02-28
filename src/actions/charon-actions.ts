"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCharonIntelligence() {
    const supabase = await createClient()

    // 1. Fetch Orders from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentOrders } = await supabase
        .from("orders")
        .select("total_amount, created_at, order_items(quantity, product_id)")
        .gte("created_at", thirtyDaysAgo.toISOString())

    // 2. Fetch all products for stock levels
    const { data: products } = await supabase
        .from("products")
        .select("id, name, stock, price")

    if (!recentOrders || !products) return null

    // --- CALCULATIONS ---

    // A. Revenue Forecast (Predictive)
    const totalRevenue30d = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const dailyAverage = totalRevenue30d / 30
    const projectedRevenueNext30d = dailyAverage * 30 // Simple linear extrapolation

    // B. Product Trends (Hot items)
    const productSalesCount: Record<string, number> = {}
    recentOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
            productSalesCount[item.product_id] = (productSalesCount[item.product_id] || 0) + item.quantity
        })
    })

    // C. Low Stock / Restock Suggestions
    const suggestions = products
        .filter(p => p.stock < 10) // Threshold for "Low Stock"
        .map(p => {
            const salesCount = productSalesCount[p.id] || 0
            let priority = "low"
            if (salesCount > 5) priority = "high"
            else if (salesCount > 0) priority = "medium"

            return {
                id: p.id,
                name: p.name,
                currentStock: p.stock,
                salesLast30d: salesCount,
                priority,
                recommendation: priority === "high"
                    ? `Urgent: Restock ${p.name}. High demand detected.`
                    : `Monitor: ${p.name} stock is low.`
            }
        })
        .sort((a, b) => {
            const priorityMap: any = { high: 0, medium: 1, low: 2 }
            return priorityMap[a.priority] - priorityMap[b.priority]
        })

    // D. General Valuation Insight
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    return {
        revenue: {
            past30d: totalRevenue30d,
            projected30d: projectedRevenueNext30d,
            dailyAvg: dailyAverage
        },
        suggestions,
        inventory: {
            totalValue: totalInventoryValue,
            totalItems: products.length
        }
    }
}
