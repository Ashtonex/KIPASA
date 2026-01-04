"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Camera,
  UserCheck,
  LayoutTemplate,
  Bell // Added for Waitlist management
} from "lucide-react"
import { cn } from "@/lib/utils"

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/staff/scanner", label: "QR Scanner", icon: Camera },
  { href: "/admin/staff", label: "Team Management", icon: UserCheck },
  { href: "/admin/content", label: "Site Content", icon: LayoutTemplate },
  // NEW: Waitlist Link
  { href: "/admin/notifications", label: "Waitlists", icon: Bell },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-col border-r bg-muted/10 hidden md:flex min-h-screen">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary font-black tracking-tighter italic">KIPASA</span> 
          <span className="text-muted-foreground font-light">Admin</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1.5 p-4 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-4 border-t bg-muted/5">
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-4 w-4" /> 
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}