"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { resetPasswordAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
    </Button>
  )
}

const initialState = { error: "", success: "" }

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState)

  return (
    <div className="flex min-h-[600px] items-center justify-center py-10 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email address and we will send you a reset link
          </p>
        </CardHeader>
        <CardContent>
          {state?.success ? (
            <div className="flex flex-col items-center gap-4 text-center p-4 bg-green-50 rounded-lg text-green-700">
              <CheckCircle2 className="h-10 w-10" />
              <p>{state.success}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {state.error}
                </div>
              )}

              <SubmitButton />
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}