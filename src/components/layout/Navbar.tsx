import Link from "next/link"
import { User, Package, LogOut, LayoutDashboard } from "lucide-react" 
import { createClient } from "@/lib/supabase/server" 
import { SearchInput } from "@/components/feature/SearchInput"
import { CartSheet } from "@/components/layout/CartSheet" 
import { MobileNav } from "@/components/layout/MobileNav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Suspense } from "react"

export async function Navbar() {
  const supabase = await createClient()

  // 1. Get the current Session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. If logged in, check the Role in the 'profiles' table
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    isAdmin = profile?.role === "admin"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* ADDED 'mx-auto' HERE TO FIX ALIGNMENT */}
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-6">
          
          <MobileNav />

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">Kipasa Store</span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
              Categories
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <Suspense fallback={<div className="w-[300px] h-10 bg-muted animate-pulse rounded-md" />}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          
          {/* Cart Drawer Component */}
          <CartSheet />

          {/* Dynamic Auth Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Standard User Links */}
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer w-full flex items-center">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="cursor-pointer w-full flex items-center">
                    <Package className="mr-2 h-4 w-4" /> Orders
                  </Link>
                </DropdownMenuItem>

                {/* Admin ONLY Link */}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full flex items-center font-semibold text-blue-600 focus:text-blue-600">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                
                {/* Logout Button */}
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="post" className="w-full">
                      <button className="w-full flex items-center text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Guest View
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}