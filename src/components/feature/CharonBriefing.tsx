"use client"

import { Brain, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function CharonBriefing({ data }: { data: any }) {
    const [isSpeaking, setIsSpeaking] = useState(false)

    const speakBrief = () => {
        if (!window.speechSynthesis) return

        // Stop any current speech
        window.speechSynthesis.cancel()

        const { revenue, suggestions } = data
        const highPriorityCount = suggestions.filter((s: any) => s.priority === 'high').length

        const text = `Good morning sir. Charon intelligence report is ready. 
      Your projected revenue for the next thirty days is ${Math.round(revenue.projected30d)} dollars. 
      The system has identified ${highPriorityCount} high priority procurement nodes. 
      The revenue pipeline is currently stable and healthy. I am standing by for further protocols.`

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9 // Slightly slower for authority
        utterance.pitch = 0.8 // Lower pitch for a more serious tone

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }

    return (
        <Button
            onClick={speakBrief}
            variant="outline"
            className={`rounded-2xl border-indigo-200 bg-white/50 backdrop-blur-sm flex items-center gap-3 px-6 h-14 shadow-lg transition-all ${isSpeaking ? 'ring-2 ring-indigo-500 border-indigo-500' : 'hover:border-indigo-400'}`}
        >
            <Volume2 className={`h-5 w-5 text-indigo-600 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <div className="text-left">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">Intelligence Protocol</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">Brief Sir</p>
            </div>
        </Button>
    )
}
