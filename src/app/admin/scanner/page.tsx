"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { markAsCollected } from "@/actions/staff-actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Camera, History, PackageCheck, QrCode, Smartphone } from "lucide-react"

type ScanHistoryItem = {
    id: string;
    time: string;
    method: 'camera' | 'link';
}

export default function StaffScannerPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    // URL Param for Auto-Scan logic
    const autoOrderId = searchParams.get("orderId")

    const [scanning, setScanning] = useState(!autoOrderId)
    const [processing, setProcessing] = useState(!!autoOrderId)
    const [history, setHistory] = useState<ScanHistoryItem[]>([])
    const [cameraError, setCameraError] = useState(false)

    // Shared processor
    const processOrder = useCallback(async (orderId: string, method: 'camera' | 'link') => {
        setProcessing(true)
        setScanning(false)

        // Stop camera if running
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear()
            } catch (e) {
                console.error("Failed to clear scanner", e)
            }
        }

        try {
            const result = await markAsCollected(orderId)

            if (result.success) {
                toast.success(`Order collected successfully!`)
                const newItem: ScanHistoryItem = {
                    id: orderId,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    method: method
                }
                setHistory(prev => [newItem, ...prev].slice(0, 10))
            } else {
                toast.error(result.message || "Failed to mark collected")
                // If error, maybe let them scan again immediately? 
                // For now, we show error state but keep them on success screen to reset manually
            }
        } catch (err) {
            toast.error("Network or Server Error")
        } finally {
            setProcessing(false)
        }
    }, [])

    // 1. AUTO-TRIGGER (Deep Link)
    useEffect(() => {
        if (autoOrderId) {
            processOrder(autoOrderId, 'link')
        }
    }, [autoOrderId, processOrder])

    // 2. CAMERA TRIGGER
    useEffect(() => {
        if (!scanning || !!autoOrderId) return;

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            }

            const scanner = new Html5QrcodeScanner("reader", config, false)
            scannerRef.current = scanner

            function onScanSuccess(decodedText: string) {
                let finalId = decodedText
                try {
                    if (decodedText.includes("orderId=")) {
                        const url = new URL(decodedText)
                        const idFromUrl = url.searchParams.get("orderId")
                        if (idFromUrl) finalId = idFromUrl
                    }
                } catch (e) {
                    // invalid url, ignore
                }
                processOrder(finalId, 'camera')
            }

            function onScanFailure(err: any) {
                // console.warn(err) // Ignore frame failures
            }

            scanner.render(onScanSuccess, onScanFailure)
        }, 100)

        return () => {
            clearTimeout(timeoutId)
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
            }
        }
    }, [scanning, autoOrderId, processOrder])

    const resetScanner = () => {
        router.replace('/admin/staff/scanner')
        setScanning(true)
        setProcessing(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Mobile Header */}
            <div className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <h1 className="font-black uppercase tracking-tight text-lg flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-400" />
                        Kipasa<span className="text-blue-400">Scan</span>
                    </h1>
                    <div className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded">
                        Mutare Branch
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 max-w-md space-y-4 mt-2">

                {/* SCANNER CARD */}
                <Card className={`border-0 shadow-lg overflow-hidden ${processing ? 'ring-4 ring-yellow-400/30' : ''}`}>
                    <CardContent className="p-0 bg-black min-h-[350px] relative flex flex-col items-center justify-center">

                        {/* STATE: PROCESSING */}
                        {processing && (
                            <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-4 p-8 text-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 animate-pulse"></div>
                                    <Loader2 className="h-16 w-16 animate-spin text-yellow-600 relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">Verifying...</h3>
                                    <p className="text-sm text-slate-500 font-medium">Checking order status</p>
                                </div>
                                {autoOrderId && (
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-400">
                                        {autoOrderId.slice(0, 12)}...
                                    </span>
                                )}
                            </div>
                        )}

                        {/* STATE: SUCCESS / DONE */}
                        {!scanning && !processing && (
                            <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Collected!</h2>
                                <p className="text-slate-500 mb-8 max-w-[200px]">Order has been successfully marked as picked up.</p>

                                <Button onClick={resetScanner} size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-14 shadow-xl shadow-slate-200">
                                    <QrCode className="mr-2 h-5 w-5" /> Scan Next Receipt
                                </Button>
                            </div>
                        )}

                        {/* STATE: CAMERA (Hidden Container managed by Lib) */}
                        <div id="reader" className={`w-full h-full ${!scanning ? 'hidden' : ''}`}></div>

                        {/* Overlay for Camera (Instruction) */}
                        {scanning && (
                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
                                <p className="text-white/80 text-xs font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                                    Align QR code within the frame
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* HISTORY LIST */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <History className="h-4 w-4" /> Session History
                        </h3>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold">
                            {history.length}
                        </span>
                    </div>

                    <div className="space-y-2 pb-10">
                        {history.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-400 text-sm">No scans yet this session.</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                            <PackageCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 font-mono">#{item.id.slice(0, 8)}</p>
                                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                {item.time} • {item.method === 'camera' ? 'Camera' : 'Deep Link'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded">
                                        DONE
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Global CSS for Scanner Lib Customization */}
            <style jsx global>{`
        #reader {
          width: 100%;
          border: none !important;
        }
        #reader video {
          object-fit: cover;
          border-radius: 0.75rem; /* rounded-xl matches card */
        }
        /* Hide the library's ugly select box if possible or style it */
        #reader__dashboard_section_csr span {
           display: none !important;
        }
      `}</style>
        </div>
    )
}