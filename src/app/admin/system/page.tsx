"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, CheckCircle2, XCircle } from "lucide-react"
import { sendDiagnosticPulse } from "@/actions/email-actions"
import { toast } from "sonner"

export default function SystemDiagnostics() {
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handlePulse = async () => {
        setIsSending(true)
        setResult(null)
        try {
            const res = await sendDiagnosticPulse()
            setResult(res)
            if (res.success) {
                toast.success("Pulse sent successfully!")
            } else {
                toast.error("Pulse failed. Check console for details.")
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
            console.error(err)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        Email Relay Verification
                    </CardTitle>
                    <CardDescription>
                        Test the connection between Kipasa Store and Resend for the admin team emails.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg border border-border">
                        <p className="text-sm font-medium mb-2">Recipients:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                            <li>harvestinventive@gmail.com</li>
                            <li>kipasagiftshop@gmail.com</li>
                            <li>ashytana@gmail.com</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handlePulse}
                        disabled={isSending}
                        className="w-full sm:w-auto"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Mail className="w-4 h-4 mr-2" />
                        )}
                        Send Diagnostic Pulse
                    </Button>

                    {result && (
                        <div className={`mt-4 p-4 rounded-lg border ${result.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                            <div className="flex items-center gap-3">
                                {result.success ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm">
                                        {result.success ? "Connection Verified" : "Relay Failure"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {result.success
                                            ? "The dispatches were accepted by the postal server."
                                            : "The server rejected the dispatches. Common causes: Invalid API Key or Unverified Domain."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Domain Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between text-sm">
                        <span>Primary Sender:</span>
                        <span className="font-mono text-blue-600">david@kipasastore.com</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span>Status:</span>
                        <span className="text-green-600 font-bold uppercase text-[10px] tracking-wider">Configured</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
