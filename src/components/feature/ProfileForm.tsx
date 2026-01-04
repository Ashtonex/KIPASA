"use client"

import { useActionState } from "react"
import { updateProfile } from "@/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

type ProfileData = {
  full_name: string | null
  email: string | undefined
  phone: string | null
  address: string | null
  city: string | null
}

const initialState = {
  message: "",
  success: false
}

export function ProfileForm({ data }: { data: ProfileData }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      
      {/* Success Message */}
      {state.success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {state.message}
        </div>
      )}

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={data.email} disabled className="bg-muted text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          name="fullName" 
          defaultValue={data.full_name || ""} 
          placeholder="John Doe" 
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          defaultValue={data.phone || ""} 
          placeholder="+263 77 123 4567" 
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input 
          id="address" 
          name="address" 
          defaultValue={data.address || ""} 
          placeholder="123 Samora Machel Ave" 
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input 
          id="city" 
          name="city" 
          defaultValue={data.city || ""} 
          placeholder="Harare" 
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}