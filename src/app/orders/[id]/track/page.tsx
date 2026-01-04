import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { OrderStepper } from "@/components/feature/OrderStepper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PrintReceiptButton } from "@/components/feature/PrintReceiptButton"

export const metadata = {
  title: "Track Order | Kipasa Store",
}

export default async function OrderTrackPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const resolvedParams = await params

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      shipping_methods (name, estimated_days),
      order_items (
        id, 
        quantity, 
        unit_price,
        products (name, images)
      )
    `)
    .eq("id", resolvedParams.id)
    .single()

  if (error || !order) return notFound()

  return (
    <div className="container mx-auto py-10 md:py-16 px-4">
      
      {/* Top Header Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Link>
        </Button>

        {/* --- PASSED ORDER ID TO THE BUTTON --- */}
        <PrintReceiptButton orderId={order.id} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Order Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Estimated Delivery: <span className="font-medium text-foreground">{order.shipping_methods?.estimated_days || "N/A"}</span>
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-mono font-bold">
                  REF: {order.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 pb-12 px-2 md:px-10">
              <OrderStepper status={order.status} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Items in this Shipment</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                 {order.order_items.map((item: any) => (
                   <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                     <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted border flex-shrink-0">
                       {item.products?.images?.[0] ? (
                         <img src={item.products.images[0]} alt={item.products.name} className="h-full w-full object-cover" />
                       ) : (
                         <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">No Image</div>
                       )}
                     </div>
                     <div className="flex-1">
                       <h4 className="font-semibold line-clamp-1 text-sm">{item.products?.name}</h4>
                       <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unit_price}</p>
                     </div>
                     <div className="font-bold text-sm">
                       ${(item.quantity * item.unit_price).toFixed(2)}
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="hidden print:block mt-8 border-t pt-4 text-right">
                 <p className="text-lg font-bold">Total Paid: ${order.total_amount?.toFixed(2)}</p>
                 <p className="text-[10px] text-muted-foreground italic">Thank you for shopping at Kipasa Store Mutare</p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-bold text-base">{order.first_name} {order.last_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_suburb}, {order.shipping_city}</p>
              <div className="mt-4 pt-4 border-t">
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Contact</p>
                 <p className="font-medium">{order.contact_phone}</p>
                 <p className="text-muted-foreground">{order.contact_email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg">Courier Info</CardTitle>
             </CardHeader>
             <CardContent className="text-sm space-y-4">
               <div>
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Method</p>
                 <p className="font-medium">{order.shipping_methods?.name || "Standard Delivery"}</p>
               </div>
               <div>
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Tracking Number</p>
                 <p className="font-mono text-sm bg-muted px-2 py-1 mt-1 inline-block rounded border">
                   {order.tracking_number || "Awaiting Dispatch"}
                 </p>
               </div>
             </CardContent>
          </Card>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center print:hidden">
            <p className="text-xs text-amber-800 font-medium">Need help with this order?</p>
            <Link href="/support" className="text-xs text-amber-900 font-bold underline mt-1 block">
              Contact Kipasa Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}