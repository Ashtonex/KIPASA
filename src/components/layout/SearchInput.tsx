"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react" // Added Loader2

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  
  // 1. Initialize the transition hook
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // 2. Wrap the navigation in startTransition to trigger isPending
    startTransition(() => {
      const encodedQuery = encodeURIComponent(query.trim())
      router.push(`/search?q=${encodedQuery}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
      {/* 3. Toggle between Search and Spinner based on isPending */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        )}
      </div>

      <Input
        type="search"
        placeholder="Search for perfumes, gear..."
        disabled={isPending} // Optional: Disable input while loading
        className={`w-full pl-10 h-10 rounded-full bg-muted/40 border-transparent transition-all shadow-sm ${
          isPending ? "opacity-70 cursor-not-allowed" : "focus:bg-background focus:border-primary"
        }`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  )
}