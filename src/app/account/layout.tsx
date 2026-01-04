import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { User, Package, Heart, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper component for sidebar links
function SidebarLink({ href, icon: Icon, children }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container flex flex-col gap-8 py-8 md:flex-row lg:gap-12 min-h-[600px]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[250px] shrink-0">
        <div className="flex flex-col gap-2">
            <div className="px-3 py-2 mb-2">
                <h2 className="font-semibold tracking-tight">My Account</h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            
            <SidebarLink href="/account" icon={User}>Profile Settings</SidebarLink>
            <SidebarLink href="/account/orders" icon={Package}>Order History</SidebarLink>
            <SidebarLink href="/account/wishlist" icon={Heart}>Wishlist</SidebarLink>
            
            <div className="my-2 border-t" />
            
            <form action="/auth/signout" method="post">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign Out
                </button>
            </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  )
}