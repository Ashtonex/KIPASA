import { getShippingMethods } from "@/actions/checkout-actions"
import { CheckoutForm } from "@/components/feature/CheckoutForm"

export const metadata = {
  title: "Checkout | Kipasa Store",
}

export default async function CheckoutPage() {
  // Fetch shipping options from DB (Mutare, Nationwide, etc.)
  const shippingMethods = await getShippingMethods()

  return (
    <div className="min-h-screen bg-slate-50/30 py-10 md:py-16">
      {/* THE FIX: 
          max-w-5xl (approx 1024px) is the ideal width for a 2-column checkout.
          mx-auto ensures this entire 5xl box is centered on the screen.
      */}
      <div className="max-w-5xl mx-auto px-4 w-full">
        
        <div className="mb-10 text-center"> 
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase securely.</p>
        </div>

        {/* By placing the form inside the same max-w-5xl wrapper as the title, 
            they will finally be perfectly aligned and centered together.
        */}
        <CheckoutForm shippingMethods={shippingMethods || []} />
      </div>
    </div>
  )
}