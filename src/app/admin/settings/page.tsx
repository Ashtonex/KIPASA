import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch Shipping Methods to display in settings
  const { data: shippingMethods } = await supabase
    .from("shipping_methods")
    .select("*")
    .order("price", { ascending: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>

      {/* Shipping Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Methods</CardTitle>
          <CardDescription>Manage how your customers receive their products.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shippingMethods?.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.estimated_days}</p>
                </div>
                <div className="font-mono font-medium">
                  ${method.price.toFixed(2)}
                </div>
              </div>
            ))}
             {(!shippingMethods || shippingMethods.length === 0) && (
              <p className="text-sm text-muted-foreground">No shipping methods configured.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Store details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Store Name: <strong>Kipasa Store</strong>
            <br />
            Currency: <strong>USD ($)</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}