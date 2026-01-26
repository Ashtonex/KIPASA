"use client"

import { useState } from "react"
import Papa from "papaparse"
import { importBulkProducts, BulkProduct } from "@/actions/bulk-product-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function BulkImportPage() {
  const router = useRouter()
  const [data, setData] = useState<BulkProduct[]>([])
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  // CSV Template Download
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,price,stock,category,description,image_url\nExample Product,25.00,100,Electronics,Great item,https://example.com/image.jpg"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "kipasa_import_template.csv")
    document.body.appendChild(link)
    link.click()
  }

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Validate and clean data
        const cleanData: BulkProduct[] = results.data.map((row: any) => ({
          name: row.name,
          price: parseFloat(row.price) || 0,
          stock: parseInt(row.stock) || 0,
          category: row.category,
          description: row.description,
          image_url: row.image_url
        })).filter((p: BulkProduct) => p.name && p.price > 0) // Filter out bad rows

        if (cleanData.length === 0) {
           toast.error("No valid products found in CSV")
        } else {
           setData(cleanData)
           toast.success(`${cleanData.length} valid rows found`)
        }
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message)
      }
    })
  }

  // Commit to Database
  const handleImport = async () => {
    if (data.length === 0) return
    setUploading(true)

    try {
      const result = await importBulkProducts(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully imported ${result.count} products`)
        router.push("/admin/products")
      }
    } catch (e) {
      toast.error("Network error during import")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Bulk Ingestion</h1>
           <p className="text-slate-500 font-medium text-xs">Upload CSV data to inventory pipeline</p>
        </div>
        <Button onClick={downloadTemplate} variant="outline" className="border-slate-200">
           <Download className="mr-2 h-4 w-4" /> Download Template
        </Button>
      </div>

      {/* Upload Zone */}
      <Card className="p-10 border-2 border-dashed border-slate-200 shadow-none flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative group">
         <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
         />
         <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8 text-blue-600" />
         </div>
         <h3 className="font-bold text-slate-900 text-lg">
            {fileName ? fileName : "Click or Drag CSV here"}
         </h3>
         <p className="text-slate-400 text-sm mt-1">Supported format: .csv</p>
      </Card>

      {/* Data Preview */}
      {data.length > 0 && (
         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
               <h3 className="font-black uppercase text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  Preview Data ({data.length})
               </h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                     <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Image Link</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {data.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                           <td className="p-3 font-bold text-slate-900 truncate max-w-[150px]">{row.name}</td>
                           <td className="p-3 font-mono">${row.price}</td>
                           <td className="p-3 font-mono">{row.stock}</td>
                           <td className="p-3">
                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                 {row.category}
                              </span>
                           </td>
                           <td className="p-3 text-xs text-slate-400 truncate max-w-[150px]">
                              {row.image_url ? (
                                 <span className="text-blue-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Valid Link</span>
                              ) : (
                                 <span className="text-amber-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> No Image</span>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {data.length > 5 && (
                  <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                     ...and {data.length - 5} more items
                  </div>
               )}
            </div>

            <Button 
               onClick={handleImport} 
               disabled={uploading}
               className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all"
            >
               {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Import ${data.length} Products`}
            </Button>
         </div>
      )}

    </div>
  )
}