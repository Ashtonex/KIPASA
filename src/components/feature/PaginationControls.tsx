"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function PaginationControls({ 
  totalCount, 
  limit = 12 
}: { 
  totalCount: number
  limit?: number 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const page = Number(searchParams.get("page") ?? "1")
  const totalPages = Math.ceil(totalCount / limit)

  // Helper to change page while keeping other filters (category, sort)
  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium">
        Page {page} of {totalPages}
      </span>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}