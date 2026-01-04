"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Package2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
             <Package2 className="h-6 w-6" />
             Kipasa Store
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            All Products
          </Link>
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            Categories
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            Track Order
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}