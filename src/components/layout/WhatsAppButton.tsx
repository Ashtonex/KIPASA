"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const phoneNumber = "263776905673" // Your Mutare support number
  const message = "Hi Kipasa Store, I have a question about my order."

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 print:hidden"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
      {/* Notification dot to catch the eye */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
        1
      </span>
    </a>
  )
}