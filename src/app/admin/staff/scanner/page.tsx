"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { markAsCollected } from "@/actions/staff-actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Camera, History, PackageCheck } from "lucide-react"

// Define a type for our history items
type ScanHistoryItem = {
  id: string;
  time: string;
}

export default function StaffScannerPage() {
  const [scanning, setScanning] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    async function onScanSuccess(decodedText: string) {
      scanner.clear()
      setScanning(false)
      setProcessing(true)

      const result = await markAsCollected(decodedText)

      if (result.success) {
        toast.success("Order marked as COLLECTED")
        // Add to local history list
        const newItem = { id: decodedText, time: new Date().toLocaleTimeString() }
        setHistory(prev => [newItem, ...prev].slice(0, 10)) // Keep last 10 scans
      } else {
        toast.error("Error: " + result.message)
      }

      setProcessing(false)
    }

    if (scanning) {
      scanner.render(onScanSuccess, (err) => {})
    }

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [scanning])

  return (
    <div className="container mx-auto py-10 px-4 max-w-md space-y-6">
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center bg-muted/50">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Camera className="h-5 w-5" /> Mutare Branch Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {processing ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-medium">Updating Order...</p>
            </div>
          ) : !scanning ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="font-semibold">Scan Successful!</p>
              <Button onClick={() => setScanning(true)} className="w-full">
                Scan Next Receipt
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg">
              <div id="reader" className="w-full"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- NEW: SCAN HISTORY SECTION --- */}
      <Card className="border shadow-sm bg-muted/20">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="h-4 w-4" /> Recent Scans (Shift)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <p className="text-xs text-center py-6 text-muted-foreground italic">
              No orders scanned yet this shift.
            </p>
          ) : (
            <div className="divide-y">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-mono font-bold uppercase">
                        {item.id.slice(0, 8)}...
                      </p>
                      <p className="text-[10px] text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                    COLLECTED
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}