"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react" // Import the QR component

interface PrintReceiptProps {
  orderId: string;
}

export function PrintReceiptButton({ orderId }: PrintReceiptProps) {
  return (
    <div className="flex flex-col items-end gap-4">
      {/* 1. The Interactive Button (Hidden during print) */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.print()} 
        className="bg-white shadow-sm hover:bg-gray-50 print:hidden"
      >
        <Printer className="mr-2 h-4 w-4" /> Print Receipt
      </Button>

      {/* 2. The QR Code (Visible ONLY during print) */}
      <div className="hidden print:flex flex-col items-center gap-2 border p-2 rounded-lg bg-white">
        <QRCodeSVG 
          value={orderId} 
          size={100} 
          level={"H"}
          includeMargin={true}
        />
        <p className="text-[10px] font-mono font-bold">MUTARE COLLECTION SCAN</p>
      </div>
    </div>
  )
}