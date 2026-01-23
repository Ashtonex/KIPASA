"use client"

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Menu,
    LayoutDashboard,
    ShoppingCart,
    QrCode,
    Users,
    LayoutTemplate,
    Bell,
    Package,
    Settings,
    Zap
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function MobileSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const routes = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/scanner", label: "QR Scanner", icon: QrCode },
        { href: "/admin/team", label: "Team Management", icon: Users },
        { href: "/admin/content", label: "Site Content", icon: LayoutTemplate },
        { href: "/admin/waitlist", label: "Waitlists", icon: Bell },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/mara-go", label: "Mara Go", icon: Zap },
    ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-[300px] bg-slate-900 border-r-slate-800 text-white overflow-y-auto">
                {/* ACCESSIBILITY FIX: 
            The SheetTitle is required by Radix UI. 
            We use "sr-only" (screen-reader only) to hide it visually 
            so it doesn't conflict with your custom header below.
         */}
                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>

                <div className="flex flex-col min-h-full p-6">

                    {/* Your Custom Header */}
                    <div className="mb-8 pl-2">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">
                            KIPASA <span className="text-blue-500">ADMIN</span>
                        </h1>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-2 pb-10">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === route.href
                                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
                                    }`}
                            >
                                <route.icon className="h-5 w-5" />
                                {route.label}
                            </Link>
                        ))}
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    )
}