"use server"

import { createClient } from "@/lib/supabase/server"

type CartItemInput = {
  id: string
  quantity: number
}

type OrderInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  suburb: string
  shippingMethodId: number
  paymentMethod: string // NEW: Received from the checkout form
  cartItems: CartItemInput[]
}

import { sendOrderEmail } from "./email-actions"

export async function placeOrder(input: OrderInput) {
  const supabase = await createClient()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch real prices from DB (Security check)
  const productIds = input.cartItems.map(item => item.id)
  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, name, price")
    .in("id", productIds)

  if (!dbProducts || dbProducts.length === 0) {
    throw new Error("Invalid products in cart")
  }

  // 3. Fetch Shipping Cost
  const { data: shippingMethod } = await supabase
    .from("shipping_methods")
    .select("id, name, price")
    .eq("id", input.shippingMethodId)
    .single()

  if (!shippingMethod) throw new Error("Invalid shipping method")

  // 4. Calculate Validated Total
  let subtotal = 0
  const orderItemsData = input.cartItems.map(item => {
    const product = dbProducts.find(p => p.id === item.id)
    if (!product) throw new Error(`Product ${item.id} not found`)

    subtotal += product.price * item.quantity

    return {
      product_id: item.id,
      quantity: item.quantity,
      unit_price: product.price,
      price_at_purchase: product.price,
      name: product.name // Include name for return
    }
  })

  const totalAmount = subtotal + shippingMethod.price

  // 5. Determine Initial Status based on Payment Method
  const initialStatus = input.paymentMethod === "cod" ? "pending_cash" : "pending"

  // 6. Create Order in DB
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id || null,
      total_amount: totalAmount,
      status: initialStatus,
      payment_method: input.paymentMethod,
      shipping_method_id: input.shippingMethodId,
      first_name: input.firstName,
      last_name: input.lastName,
      contact_email: input.email,
      contact_phone: input.phone,
      shipping_address: input.address,
      shipping_city: input.city,
      shipping_suburb: input.suburb
    })
    .select("id")
    .single()

  if (orderError) {
    console.error("Order Insert Error Details:", orderError)
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  // 7. Insert Order Items
  const itemsToInsert = orderItemsData.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    price_at_purchase: item.price_at_purchase
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert)

  if (itemsError) {
    console.error("Items Insert Error:", itemsError)
    throw new Error("Order created, but failed to save items.")
  }

  // 8. Send Email Notification
  try {
    await sendOrderEmail({
      orderId: order.id,
      customerName: `${input.firstName} ${input.lastName}`,
      email: input.email,
      phone: input.phone,
      address: `${input.address}, ${input.suburb}, ${input.city}`,
      items: orderItemsData.map(i => ({ name: i.name || "Product", quantity: i.quantity, price: i.unit_price })),
      total: totalAmount,
      paymentMethod: input.paymentMethod,
    })
  } catch (emailErr) {
    console.error("Non-fatal email error:", emailErr)
  }

  return {
    success: true,
    orderId: order.id,
    orderDetails: {
      customerName: `${input.firstName} ${input.lastName}`,
      items: orderItemsData.map(i => ({ name: i.name, quantity: i.quantity, price: i.unit_price })),
      total: totalAmount,
      shippingMethod: shippingMethod.name
    }
  }
}
