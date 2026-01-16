"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation" // Added for URL handling
import { Html5QrcodeScanner } from "html5-qrcode"
import { markAsCollected } from "@/actions/staff-actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Camera, History, PackageCheck, QrCode } from "lucide-react"

type ScanHistoryItem = {
  id: string;
  time: string;
  method: 'camera' | 'link'; // Track how it was scanned
}

export default function StaffScannerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // URL Param for Auto-Scan
  const autoOrderId = searchParams.get("orderId")

  const [scanning, setScanning] = useState(!autoOrderId) // Don't start camera if we have a URL ID
  const [processing, setProcessing] = useState(!!autoOrderId) // Start processing immediately if URL ID exists
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  // Shared function to process ANY scan (whether from URL or Camera)
  const processOrder = useCallback(async (orderId: string, method: 'camera' | 'link') => {
    setProcessing(true)
    setScanning(false)

    try {
      // 1. Server Action
      const result = await markAsCollected(orderId)

      if (result.success) {
        toast.success(`Order ${orderId.slice(0,6)}... collected!`)
        
        // 2. Update History
        const newItem: ScanHistoryItem = { 
          id: orderId, 
          time: new Date().toLocaleTimeString(),
          method: method
        }
        setHistory(prev => [newItem, ...prev].slice(0, 10))
      } else {
        toast.error("Error: " + result.message)
      }
    } catch (err) {
      toast.error("Failed to process order connection")
    } finally {
      setProcessing(false)
    }
  }, [])

  // 1. AUTO-TRIGGER: Handle URL Parameters
  useEffect(() => {
    if (autoOrderId) {
      processOrder(autoOrderId, 'link')
    }
  }, [autoOrderId, processOrder])

  // 2. MANUAL TRIGGER: Handle Camera Scanner
  useEffect(() => {
    // Only initialize camera if we are in scanning mode and NOT processing an auto-link
    if (!scanning || !!autoOrderId) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    function onScanSuccess(decodedText: string) {
      // Check if decoded text is a full URL or just an ID
      let finalId = decodedText
      
      try {
        // If it's a URL like "https://kipasa.../scanner?orderId=xyz", extract the ID
        if (decodedText.includes("orderId=")) {
          const url = new URL(decodedText)
          const idFromUrl = url.searchParams.get("orderId")
          if (idFromUrl) finalId = idFromUrl
        }
      } catch (e) {
        // Not a URL, treat as raw ID
      }

      scanner.clear()
      processOrder(finalId, 'camera')
    }

    scanner.render(onScanSuccess, (err) => {})

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [scanning, autoOrderId, processOrder])

  // Reset function to clear URL params so we can scan again
  const resetScanner = () => {
    router.replace('/admin/staff/scanner') // Clear the URL
    setScanning(true)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-md space-y-6">
      <Card className={`border-2 shadow-xl ${processing ? 'border-yellow-400' : 'border-primary/20'}`}>
        <CardHeader className="text-center bg-muted/50">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Camera className="h-5 w-5" /> Mutare Branch Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {processing ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
              <p className="font-medium animate-pulse text-yellow-700">
                Verifying Collection...
              </p>
              {autoOrderId && (
                <p className="text-xs text-muted-foreground font-mono">ID: {autoOrderId}</p>
              )}
            </div>
          ) : !scanning ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="bg-green-100 p-3 rounded-full animate-in zoom-in duration-300">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="font-semibold text-green-900">Collection Recorded!</p>
              
              <Button onClick={resetScanner} className="w-full bg-black hover:bg-gray-800">
                <QrCode className="mr-2 h-4 w-4" /> Scan Next Receipt
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-black/5 min-h-[300px] flex items-center justify-center">
              <div id="reader" className="w-full"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- HISTORY SECTION --- */}
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
                <div key={index} className="flex items-center justify-between p-3 bg-white/50">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-mono font-bold uppercase text-gray-900">
                        {item.id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span className="capitalize">{item.method} scan</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
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