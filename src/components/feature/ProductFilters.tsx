"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import { useState } from "react"

interface Category {
  id: number
  name: string
  slug: string
}

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for mobile drawer
  const [open, setOpen] = useState(false)

  // 1. Helper to update URL params
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset page to 1 when filters change
    params.set("page", "1")
    
    router.push(`?${params.toString()}`)
  }

  // 2. Filter Content (Shared between Desktop Sidebar & Mobile Drawer)
  const FilterContent = () => (
    <div className="space-y-8">
      {/* Sort Options */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">Sort By</h3>
        <RadioGroup 
          defaultValue={searchParams.get("sort") || "newest"} 
          onValueChange={(val) => updateFilters("sort", val)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="newest" />
            <Label htmlFor="newest">Newest Arrivals</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-asc" id="price-asc" />
            <Label htmlFor="price-asc">Price: Low to High</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-desc" id="price-desc" />
            <Label htmlFor="price-desc">Price: High to Low</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => {
            const isActive = searchParams.get("category") === cat.slug
            return (
              <div key={cat.id} className="flex items-center">
                 <button
                   onClick={() => updateFilters("category", isActive ? null : cat.slug)}
                   className={`text-sm hover:underline ${isActive ? "font-bold text-primary" : "text-muted-foreground"}`}
                 >
                   {cat.name}
                 </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Range (Simple Inputs) */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            className="w-20"
            defaultValue={searchParams.get("minPrice") || ""}
            onChange={(e) => {
               // Debounce this in a real app, strict update for now
               setTimeout(() => updateFilters("minPrice", e.target.value), 500)
            }}
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            className="w-20"
            defaultValue={searchParams.get("maxPrice") || ""}
            onChange={(e) => {
               setTimeout(() => updateFilters("maxPrice", e.target.value), 500)
            }}
          />
        </div>
      </div>
      
      {/* Clear Filters Button */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => router.push("/products")}
      >
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop View: Static Sidebar */}
      <div className="hidden lg:block w-64 pr-8 border-r">
        <FilterContent />
      </div>

      {/* Mobile View: Drawer Button */}
      <div className="lg:hidden mb-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Filters & Sort
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-8">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}