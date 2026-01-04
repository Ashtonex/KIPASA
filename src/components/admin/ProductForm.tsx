"use client"

import { useState, useActionState, useEffect } from "react"
import Link from "next/link"
import { upsertProduct } from "@/actions/admin-products-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, Image as ImageIcon, AlertCircle, FolderOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Product = {
  id?: string
  name: string
  description: string | null
  price: number
  category: string
  images: string[] | null
  stock: number
}

type Category = {
  label: string
  value: string
}

const initialState = {
  message: "",
}

const FALLBACK_CATEGORIES: Category[] = [
  { label: "Tactical Wear", value: "tactical-wear" },
  { label: "Biker Wear", value: "biker-wear" },
  { label: "Outdoors", value: "outdoors" },
  { label: "Games", value: "games" },
  { label: "Perfumes", value: "perfumes" },
  { label: "Ornaments", value: "ornaments" },
  { label: "Bags & Wallets", value: "bags-and-wallets" },
  { label: "Jewelry", value: "jewelry" },
  { label: "General Gifts", value: "general-gifts" },
  { label: "Dog Accessories", value: "dog-accessories" },
  { label: "Headgear", value: "headgear" },
  { label: "Zimbo Wear", value: "zimbo-wear" },
  { label: "Lingerie", value: "lingerie" },
]

export function ProductForm({ 
  product, 
  categories = [] 
}: { 
  product?: Product, 
  categories: Category[] 
}) {
  const [state, formAction, isPending] = useActionState(upsertProduct, initialState)
  
  // AMENDED: Initialize with "" instead of undefined to keep inputs controlled
  const [imageUrl, setImageUrl] = useState<string>(product?.images?.[0] || "")
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category || "")
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const displayCategories = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("products").getPublicUrl(filePath)
      setImageUrl(data.publicUrl)
    } catch (error) {
      console.error("Upload failed", error)
      alert("Image upload failed.")
    } finally {
      setUploading(false)
    }
  }

  if (!mounted) return <div className="max-w-2xl p-8 border rounded-xl animate-pulse bg-gray-50 h-[600px]" />

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {state?.message && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {state.message}
        </div>
      )}

      {/* AMENDED: Ensuring hidden inputs are never undefined */}
      <input type="hidden" name="id" value={product?.id || ""} />
      <input type="hidden" name="imageUrl" value={imageUrl || ""} />
      <input type="hidden" name="category" value={selectedCategory || ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input name="name" defaultValue={product?.name || ""} required />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Category</Label>
            <Link 
              href="/admin/categories" 
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <FolderOpen className="h-3 w-3" /> Manage Categories
            </Link>
          </div>
          
          <Select 
            onValueChange={setSelectedCategory} 
            value={selectedCategory || ""}
            required
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              {displayCategories.map((cat, idx) => (
                <SelectItem key={`${cat.value}-${idx}`} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
              
              {categories.length === 0 && (
                <div className="p-2 border-t mt-1 text-[9px] text-amber-600 bg-amber-50 text-center uppercase font-bold">
                  Fallback Active (DB Empty)
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={product?.description || ""} rows={4} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Price ($)</Label>
          <Input name="price" type="number" step="0.01" defaultValue={product?.price || ""} required />
        </div>
        <div className="space-y-2">
          <Label>Stock Quantity</Label>
          <Input name="stock" type="number" defaultValue={product?.stock || 0} required />
        </div>
      </div>

      <Card className="border-dashed bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
          {imageUrl ? (
            <div className="relative h-40 w-40 overflow-hidden rounded-md border shadow-sm">
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                onClick={() => setImageUrl("")}
              >
                ×
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-sm">No image selected</span>
            </div>
          )}

          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Image
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isPending || uploading} className="w-full rounded-xl">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product?.id ? "Update Product" : "Create Product"}
      </Button>
    </form>
  )
}