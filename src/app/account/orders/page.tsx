import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ArrowRight } from "lucide-react"

export const metadata = { title: "My Orders" }

export default async function OrdersPage() {
  const supabase = await createClient()
  
  // Fetch logged-in user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .order("created_at", { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10">
        <Package className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/30">
              <div className="space-y-1">
                <CardTitle className="text-base">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {order.order_items[0].count} Items
                </p>
                <p className="font-bold">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/orders/${order.id}/track`}>
                  Track Order <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}