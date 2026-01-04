"use client"

import { useState } from "react"
import { Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitReview } from "@/actions/review-actions"
import { cn } from "@/lib/utils"

export function ProductReviews({ productId, reviews, userId }: { productId: string, reviews: any[], userId?: string }) {
  const [rating, setRating] = useState(5)
  
  return (
    <div className="space-y-8 mt-16 border-t pt-10">
      <h2 className="text-2xl font-bold">Customer Reviews ({reviews.length})</h2>

      <div className="grid md:grid-cols-2 gap-10">
        
        {/* List of Reviews */}
        <div className="space-y-6">
          {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet. Be the first!</p>}
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                     <User className="h-4 w-4" />
                   </div>
                   <span className="font-semibold text-sm">
                     {review.profiles?.full_name || "Customer"}
                   </span>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Review Form */}
        <div className="bg-muted/30 p-6 rounded-xl h-fit">
          <h3 className="font-bold mb-4">Write a Review</h3>
          {!userId ? (
            <div className="text-sm">Please <a href="/login" className="underline text-primary">login</a> to write a review.</div>
          ) : (
            <form action={async (formData) => {
                await submitReview(formData)
                // In a real app, use a toast here
                alert("Review submitted!")
            }} className="space-y-4">
              <input type="hidden" name="productId" value={productId} />
              
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={cn("h-6 w-6", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                    >
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
                </div>
                <input type="hidden" name="rating" value={rating} />
              </div>

              <div>
                <label className="text-sm font-medium">Review</label>
                <Textarea name="comment" placeholder="How was the product?" required />
              </div>

              <Button type="submit">Submit Review</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}