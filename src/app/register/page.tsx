"use client"

import { useActionState } from "react" // <--- IMPORT FROM REACT (NOT REACT-DOM)
import Link from "next/link"
import { registerUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const initialState = {
  error: "",
  success: false,
}

export default function RegisterPage() {
  // We use useActionState because you are on Next.js 15 / React 19
  const [state, action, isPending] = useActionState(registerUser, initialState)

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4">
            
            {/* Display the Error Message */}
            {state?.error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm font-medium border border-red-200">
                ⚠️ {state.error}
              </div>
            )}

            {/* Success Message */}
            {state?.success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md text-sm font-medium border border-green-200">
                ✅ Account created! Redirecting...
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" placeholder="John Doe" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            Already have an account?{" "}
            <Link href="/login" className="underline">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}