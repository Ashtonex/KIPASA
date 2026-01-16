"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react" // Canvas is more reliable for print drivers

interface PrintReceiptProps {
  orderId: string;
}

export function PrintReceiptButton({ orderId }: PrintReceiptProps) {
  const verificationUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/admin/staff/scanner?orderId=${orderId}`
    : `https://kipasa.co.zw/admin/staff/scanner?orderId=${orderId}`; // Fallback if window is undefined

  return (
    <div className="flex flex-col items-end gap-4">
      
      {/* 1. SCREEN ONLY: The Button */}
      <div className="screen-only-force">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.print()} 
          className="bg-white shadow-sm hover:bg-gray-50"
        >
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </div>

      {/* 2. PRINT ONLY: The QR Code */}
      {/* We use the custom class .print-only-force defined in globals.css */}
      <div className="print-only-force mt-8 border-2 border-black p-4 rounded-xl">
        
        {/* Verification Text */}
        <p className="text-[12px] font-bold uppercase tracking-widest text-black mb-2 text-center">
          Scan to Verify
        </p>

        {/* The QR Canvas */}
        <div className="bg-white p-2">
          <QRCodeCanvas 
            value={verificationUrl} 
            size={150} 
            level={"H"}
            includeMargin={true}
            // Direct style override to ensure it has size
            style={{ width: '150px', height: '150px' }}
          />
        </div>

        {/* Order ID */}
        <p className="text-[10px] font-mono text-black mt-2 text-center">
          ID: {orderId}
        </p>
      </div>
    </div>
  )
}