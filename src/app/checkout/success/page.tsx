import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, ArrowRight, QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { QRCodeSVG } from "qrcode.react"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // NEXT.JS 15 FIX: searchParams must be awaited
  const resolvedParams = await searchParams;
  const orderId = typeof resolvedParams.orderId === "string" ? resolvedParams.orderId : "N/A"
  const isPaymentPending = resolvedParams.payment === "pending"

  // Fetch order items to display QR codes
  const supabase = await createClient()
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(`
      id,
      product_id,
      products (
        name
      )
    `)
    .eq("order_id", orderId)

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-10 mx-auto px-4">
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-4xl">

        {/* SUCCESS MESSAGE */}
        <Card className="text-center border-green-100 shadow-lg h-fit">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-300">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Order Received!</CardTitle>
            {isPaymentPending && (
              <p className="text-sm font-medium text-amber-600 bg-amber-50 py-1 px-3 rounded-full mx-auto mt-2 inline-block">
                Payment Pending Confirmation
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Thank you for your purchase. {isPaymentPending
                ? "We are currently waiting for payment confirmation from Paynow."
                : "Your order has been confirmed and is being processed."}
            </p>

            <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Reference</p>
              <p className="font-mono text-xl font-bold tracking-widest text-primary mt-1">
                {orderId !== "N/A" ? orderId.slice(0, 8).toUpperCase() : "REF-ERROR"}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button asChild className="w-full" size="lg">
                <Link href={`/orders/${orderId}/track`}>
                  <MapPin className="mr-2 h-4 w-4" /> Track Order Status
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/products">
                  Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR CODES SECTION */}
        <Card className="border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Digital Receipts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[500px]">
            {orderItems && orderItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {orderItems.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-black text-slate-800 uppercase tracking-tight text-sm">
                        {(item.products as any)?.name || "Product"}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                        ID: {item.product_id?.slice(0, 8)}
                      </p>
                    </div>
                    <div className="p-2 bg-white border-2 border-slate-50 rounded-xl shadow-sm">
                      <QRCodeSVG
                        value={`${orderId}:${item.product_id}`}
                        size={80}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <p className="text-xs font-black uppercase tracking-widest">Generating Digital Keys...</p>
              </div>
            )}

            <div className="p-6 bg-blue-50/50 border-t border-blue-100">
              <p className="text-[10px] font-black text-blue-800 uppercase leading-relaxed tracking-tight">
                Screenshot these QR codes for easy pickup and verification. They are unique to your order and products.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
