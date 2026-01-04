"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { Input } from "@/components/ui/input"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 1. Initialize state with current URL param (if any)
  const initialQuery = searchParams.get("q") || ""
  const [text, setText] = useState(initialQuery)
  
  // 2. Debounce the input: wait 500ms after user stops typing
  const [query] = useDebounce(text, 500)

  // 3. Effect: Update URL when debounced query changes
  useEffect(() => {
    // Avoid pushing if the query hasn't actually changed from the URL
    if (query === initialQuery) return

    if (!query) {
      router.push("/products") // Clear search -> go to main list
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }, [query, router, initialQuery])

  return (
    <div className="relative w-full max-w-[300px] md:w-[300px]">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        className="w-full bg-background pl-9 md:w-[300px]"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}