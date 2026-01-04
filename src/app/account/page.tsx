import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileForm } from "@/components/feature/ProfileForm"

export const metadata = { title: "Profile Settings" }

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // 1. Get Auth User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Fetch Profile Data (Now including phone, address, city)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address, city")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and shipping address.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            data={{
              email: user.email,
              full_name: profile?.full_name ?? "",
              phone: profile?.phone ?? "",
              address: profile?.address ?? "",
              city: profile?.city ?? ""
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}