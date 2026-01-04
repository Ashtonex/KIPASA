"use client" // This enables interactivity

import { updateProductPromo } from "@/actions/admin-products-actions"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function PromoToggles({ 
  productId, 
  isFlashDeal, 
  isJustForYou 
}: { 
  productId: string, 
  isFlashDeal: boolean, 
  isJustForYou: boolean 
}) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (updates: { is_flash_deal?: boolean, is_just_for_you?: boolean }) => {
    startTransition(async () => {
      await updateProductPromo(productId, updates)
    })
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {isPending && (
        <div className="absolute -left-6 top-1">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </div>
      )}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input 
          type="checkbox" 
          disabled={isPending}
          defaultChecked={isFlashDeal} 
          onChange={(e) => handleToggle({ is_flash_deal: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 disabled:opacity-50"
        />
        <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">Flash Deal</span>
      </label>
      
      <label className="flex items-center gap-2 cursor-pointer group">
        <input 
          type="checkbox" 
          disabled={isPending}
          defaultChecked={isJustForYou} 
          onChange={(e) => handleToggle({ is_just_for_you: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 disabled:opacity-50"
        />
        <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">Just For You</span>
      </label>
    </div>
  )
}