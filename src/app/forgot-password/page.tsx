"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { resetPasswordAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Mail } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full font-black uppercase tracking-widest text-[11px] h-12 rounded-xl" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initiate Recovery"}
    </Button>
  )
}

// FIX: Initial state 'success' must be boolean to match the server action
const initialState = { error: "", success: false }

export default function ForgotPasswordPage() {
  // FIX: useActionState is the updated hook for Next.js 15+
  const [state, formAction] = useActionState(resetPasswordAction, initialState)

  return (
    <div className="flex min-h-[600px] items-center justify-center py-10 px-4 bg-slate-50/50">
      <Card className="w-full max-w-sm border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-2 pt-8">
          <div className="mx-auto bg-blue-50 p-3 rounded-2xl w-fit mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-black text-center uppercase tracking-tighter">Reset Password</CardTitle>
          <p className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider px-4">
            Transmission link will be sent to your verified email
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          {state?.success ? (
            <div className="flex flex-col items-center gap-4 text-center p-6 bg-green-50 rounded-3xl text-green-700 border border-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <div className="space-y-1">
                <p className="font-black uppercase text-xs tracking-widest">Link Dispatched</p>
                <p className="text-[11px] font-medium opacity-80">Check your inbox and spam folder for instructions.</p>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest pl-1 text-slate-400">Target Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-blue-600 font-bold"
                />
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 uppercase tracking-tight">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.error}
                </div>
              )}

              <SubmitButton />
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center bg-slate-50/50 py-6 border-t border-slate-100">
          <Link href="/login" className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all">
            <ArrowLeft className="mr-2 h-3 w-3" /> Back to Terminal
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}