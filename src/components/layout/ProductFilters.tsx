"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

const CATEGORIES = ["All", "Clothing", "Electronics", "Home", "Beauty", "Footwear"]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get("category") || "All"
  const [priceRange, setPriceRange] = useState([0, 500])

  // Update URL when filter changes
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "All") {
      params.delete("category")
    } else {
      params.set("category", category.toLowerCase())
    }
    router.push(`/products?${params.toString()}`)
  }

  // Handle Price Apply
  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Categories</h3>
        <RadioGroup value={currentCategory} onValueChange={handleCategoryChange} className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <RadioGroupItem value={cat === "All" ? "All" : cat.toLowerCase()} id={cat} />
              <Label htmlFor={cat} className="cursor-pointer">{cat}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Filter */}
      <div className="space-y-4">
         <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Price Range</h3>
         <Slider 
           defaultValue={[0, 500]} 
           max={1000} 
           step={10} 
           value={priceRange} 
           onValueChange={setPriceRange} 
           className="my-4"
         />
         <div className="flex items-center justify-between">
           <span className="text-sm border px-2 py-1 rounded">${priceRange[0]}</span>
           <span className="text-xs text-muted-foreground">to</span>
           <span className="text-sm border px-2 py-1 rounded">${priceRange[1]}</span>
         </div>
         <Button variant="outline" size="sm" className="w-full" onClick={applyPriceFilter}>
           Apply
         </Button>
      </div>
    </div>
  )
}