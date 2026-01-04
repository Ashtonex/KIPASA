"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle2 } from "lucide-react"
import { sendSupportTicket } from "@/actions/support-actions"
import { toast } from "sonner"

export function ContactForm() {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    const result = await sendSupportTicket(formData)
    setIsPending(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Message sent successfully!")
    } else {
      toast.error("Failed to send message. Please try again.")
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-700">Message Received!</h3>
        <p className="text-muted-foreground mt-2 max-w-[300px]">
          Thank you for reaching out. Our team in Mutare will get back to you via email within 24 hours.
        </p>
        <Button 
          variant="outline" 
          className="mt-6" 
          onClick={() => setIsSuccess(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="Ashton Munene" required disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="ashtona@gmail.com" required disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea 
          id="message" 
          name="message" 
          placeholder="I have a question about delivery to Murambi..." 
          className="min-h-[120px]" 
          required 
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : (
          <><Send className="mr-2 h-4 w-4" /> Send Inquiry</>
        )}
      </Button>
    </form>
  )
}