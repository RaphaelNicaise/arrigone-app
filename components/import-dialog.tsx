"use client"

import { useState } from "react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { mapExcelHeaders } from "@/lib/xlsx-helpers"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [allMappedData, setAllMappedData] = useState<any[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [fileName, setFileName] = useState("")
  const [importResult, setImportResult] = useState<{ imported: number, errors: number } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportResult(null)
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        
        // Get raw data
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
        if (rawData.length < 2) {
          toast.error("El archivo está vacío o no tiene encabezados")
          return
        }

        const headers = rawData[0]
        const rows = rawData.slice(1)
        
        // Map data using helper
        const headerMap = mapExcelHeaders(headers)
        const mappedData = rows.map(row => {
          const obj: any = {}
          Object.entries(headerMap).forEach(([index, key]) => {
            obj[key] = row[parseInt(index)]
          })
          return obj
        })
        
        setAllMappedData(mappedData)
        setPreviewData(mappedData.slice(0, 5)) // Preview first 5
        setTotalRows(mappedData.length)
      } catch (err) {
        toast.error("Error al procesar el archivo Excel")
        console.error(err)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (totalRows === 0) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/propiedades/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: allMappedData }),
      })

      const result = await res.json()
      
      if (res.ok) {
        setImportResult({ imported: result.imported, errors: result.errors })
        if (result.errors > 0) {
          toast.warning(`Se importaron ${result.imported} propiedades con ${result.errors} errores`)
        } else {
          toast.success(`Se importaron ${result.imported} propiedades exitosamente`)
        }
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
        }, 2000)
      } else {
        toast.error(result.error || "Error durante la importación")
      }
    } catch (err) {
      toast.error("Error de conexión al importar")
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setPreviewData([])
    setAllMappedData([])
    setTotalRows(0)
    setFileName("")
    setImportResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetState()
      onOpenChange(val)
    }}>
      <DialogContent className="max-w-3xl bg-[#FBFBFA]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Importar Propiedades
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx, .xls) o CSV. El sistema mapeará automáticamente las columnas.
          </DialogDescription>
        </DialogHeader>

        {!previewData.length && !importResult && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#EAEAEA] rounded-xl p-12 bg-white mt-4">
            <Input 
              id="excel-file"
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <Button variant="outline" onClick={() => document.getElementById('excel-file')?.click()}>
              Seleccionar Archivo
            </Button>
            <p className="text-sm text-muted-foreground mt-4">Solo archivos .xlsx, .xls o .csv</p>
          </div>
        )}

        {previewData.length > 0 && !importResult && (
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#EAEAEA]">
              <span className="font-medium text-sm">{fileName}</span>
              <span className="text-sm text-muted-foreground">{totalRows} filas detectadas</span>
            </div>

            <div className="bg-white border border-[#EAEAEA] rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                Vista Previa (Primeras 5 filas)
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="max-w-[200px] truncate">{row.direccion || '-'}</TableCell>
                        <TableCell>{row.tipo || '-'}</TableCell>
                        <TableCell>{row.precio ? `${row.precio_moneda} ${row.precio}` : (row.precio_moneda || '-')}</TableCell>
                        <TableCell>{row.estado || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetState} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={loading} className="bg-[#111111] text-white hover:bg-[#111111]/90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Importación
              </Button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-semibold">Importación Finalizada</h3>
            <div className="text-center space-y-1 text-muted-foreground">
              <p>{importResult.imported} propiedades importadas correctamente.</p>
              {importResult.errors > 0 && (
                <p className="text-destructive flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {importResult.errors} errores omitidos.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
