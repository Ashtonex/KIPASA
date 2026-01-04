"use client"

import { subscribeToNewsletter } from "@/actions/newsletter-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail } from "lucide-react"
import { useState, useTransition } from "react"

export function NewsletterForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  async function handleSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)
      setMessage({
        text: result.message,
        type: result.success ? 'success' : 'error'
      })
      // Clear form on success
      if (result.success) {
        (document.getElementById("newsletter-form") as HTMLFormElement)?.reset()
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <form id="newsletter-form" action={handleSubmit} className="flex gap-2">
        <Input 
          name="email" 
          type="email" 
          placeholder="Enter your email" 
          required 
          className="bg-background max-w-[220px]"
        />
        <Button type="submit" size="icon" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          <span className="sr-only">Subscribe</span>
        </Button>
      </form>
      {message && (
        <p className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}