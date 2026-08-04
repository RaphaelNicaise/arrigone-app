"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Property, Vendedor, PropertyStatus, PropertyType, PropertyForm, CreditStatus, KeysStatus, Currency } from "@/lib/types"
import { PROPERTY_TYPES, PROPERTY_FORMS, CREDIT_OPTIONS, KEYS_OPTIONS, STATUS_OPTIONS, STATUS_COLORS } from "@/lib/constants"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, Check, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property | null
  vendedores: Vendedor[]
  onSuccess: () => void
}

interface FormDataState {
  direccion: string;
  tipo: PropertyType | "";
  forma: PropertyForm | "";
  apta_credito: CreditStatus | "";
  fecha: string;
  precio_monto: number | null;
  precio_moneda: Currency | "" | string;
  precio_no_disponible: boolean;
  dormitorios: string;
  llaves: KeysStatus | "";
  info_credito: string;
  vendedor_id: string | null;
  link: string;
  estado: PropertyStatus;
}

export default function PropertyFormDialog({ open, onOpenChange, property, vendedores, onSuccess }: PropertyFormDialogProps) {
  const isEdit = !!property
  const [loading, setLoading] = useState(false)
  const [vendedorSearch, setVendedorSearch] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [creatingVendedor, setCreatingVendedor] = useState(false)
  const [localVendedores, setLocalVendedores] = useState<Vendedor[]>(vendedores)

  useEffect(() => {
    setLocalVendedores(vendedores)
  }, [vendedores])

  const [formData, setFormData] = useState<FormDataState>({
    direccion: "",
    tipo: "",
    forma: "",
    apta_credito: "",
    fecha: "",
    precio_monto: null,
    precio_moneda: "",
    precio_no_disponible: false,
    dormitorios: "",
    llaves: "",
    info_credito: "",
    vendedor_id: null,
    link: "",
    estado: "disponible",
  })

  useEffect(() => {
    if (property) {
      setFormData({
        direccion: property.direccion || "",
        tipo: property.tipo || "",
        forma: property.forma || "",
        apta_credito: property.apta_credito || "",
        fecha: property.fecha || "",
        precio_monto: property.precio_monto ?? null,
        precio_moneda: property.precio_moneda || "",
        precio_no_disponible: !!property.precio_no_disponible,
        dormitorios: property.dormitorios || "",
        llaves: property.llaves || "",
        info_credito: property.info_credito || "",
        vendedor_id: property.vendedor_id || null,
        link: property.link || "",
        estado: property.estado || "disponible",
      })
    } else {
      setFormData({
        direccion: "",
        tipo: "",
        forma: "",
        apta_credito: "",
        fecha: "",
        precio_monto: null,
        precio_moneda: "",
        precio_no_disponible: false,
        dormitorios: "",
        llaves: "",
        info_credito: "",
        vendedor_id: null,
        link: "",
        estado: "disponible",
      })
    }
  }, [property, open])

  const handleCreateVendedor = async (nombre: string) => {
    setCreatingVendedor(true)
    try {
      const res = await fetch("/api/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
      })
      if (res.ok) {
        const newV = await res.json()
        setLocalVendedores(prev => [...prev, newV])
        setFormData(prev => ({ ...prev, vendedor_id: newV.id }))
        toast.success(`Vendedor ${nombre} creado`)
        setComboboxOpen(false)
        setVendedorSearch("")
      }
    } catch {
      toast.error("Error al crear vendedor")
    } finally {
      setCreatingVendedor(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
        return;
      }
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = property ? `/api/propiedades/${property.id}` : "/api/propiedades"
      const method = property ? "PUT" : "POST"

      const dataToSubmit = {
        direccion: formData.direccion || null,
        tipo: formData.tipo || null,
        forma: formData.forma || null,
        apta_credito: formData.apta_credito || null,
        fecha: formData.fecha || null,
        precio_monto: formData.precio_no_disponible ? null : formData.precio_monto,
        precio_moneda: formData.precio_no_disponible ? null : formData.precio_moneda,
        precio_no_disponible: formData.precio_no_disponible,
        dormitorios: formData.dormitorios || null,
        llaves: formData.llaves || null,
        info_credito: formData.info_credito || null,
        vendedor_id: formData.vendedor_id || null,
        link: formData.link || null,
        estado: formData.estado,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit)
      })

      if (res.ok) {
        toast.success(property ? "Propiedad actualizada" : "Propiedad creada")
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error("Error al guardar la propiedad")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const filteredVendedores = localVendedores.filter(v => 
    v.nombre.toLowerCase().includes(vendedorSearch.toLowerCase())
  )
  const hasExactMatch = localVendedores.some(v => v.nombre.toLowerCase() === vendedorSearch.toLowerCase().trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-hidden flex flex-col bg-[#FBFBFA]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEdit ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifica los datos de la propiedad." : "Ingresa los datos para registrar una nueva propiedad."} Todos los campos son opcionales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-1 overflow-hidden mt-4">
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input 
                value={formData.direccion} 
                onChange={(e) => setFormData({...formData, direccion: e.target.value})} 
                placeholder="Ej. Av. San Martín 123"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.estado} onValueChange={(val) => setFormData({...formData, estado: val as PropertyStatus})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.value]?.border || '#ccc' }} />
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.tipo} onValueChange={(val) => setFormData({...formData, tipo: val as PropertyType})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Forma</Label>
              <Select value={formData.forma} onValueChange={(val) => setFormData({...formData, forma: val as PropertyForm})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_FORMS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-muted">
              <Label className="text-base font-semibold">Precio</Label>
              {isEdit && property?.precio_monto == null && property?.precio_moneda && property.precio_moneda !== "USD" && property.precio_moneda !== "ARS" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-md mb-4">
                  <p className="font-semibold mb-1">Texto original a migrar:</p>
                  <p className="font-mono text-xs bg-amber-100 p-2 rounded">{property.precio_moneda}</p>
                  <p className="mt-1 text-xs text-amber-700">Por favor, escribí el valor numérico abajo, seleccioná la moneda, y copiá cualquier aclaración extra al campo de "Detalle".</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Numérico</Label>
                  <Input 
                    type="number"
                    value={formData.precio_monto ?? ""} 
                    onChange={(e) => setFormData({...formData, precio_monto: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="Ej. 150000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={formData.precio_moneda === "USD" || formData.precio_moneda === "ARS" ? formData.precio_moneda : ""} onValueChange={(val) => setFormData({...formData, precio_moneda: val as Currency})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólares</SelectItem>
                      <SelectItem value="ARS">ARS - Pesos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dormitorios</Label>
              <Input 
                value={formData.dormitorios} 
                onChange={(e) => setFormData({...formData, dormitorios: e.target.value})}
                placeholder="Ej. 2, 3, Funcional..." 
              />
            </div>

            <div className="space-y-2">
              <Label>Apta Crédito</Label>
              <Select value={formData.apta_credito} onValueChange={(val) => setFormData({...formData, apta_credito: val as CreditStatus})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {CREDIT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Llaves</Label>
              <Select value={formData.llaves} onValueChange={(val) => setFormData({...formData, llaves: val as KeysStatus})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {KEYS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha (Texto libre)</Label>
              <Input 
                type="text"
                value={formData.fecha} 
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                placeholder="Ej. Marzo 2026, ?, 15/04/2026..."
              />
            </div>

            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger render={<Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between" />}>
                  <span className="truncate">
                    {formData.vendedor_id 
                      ? localVendedores.find((v) => v.id === formData.vendedor_id)?.nombre 
                      : "Seleccionar vendedor..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <Input 
                        placeholder="Buscar o crear..." 
                        value={vendedorSearch}
                        onChange={(e) => setVendedorSearch(e.target.value)}
                        className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredVendedores.map((v) => (
                        <div
                          key={v.id}
                          className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
                          onClick={() => {
                            setFormData({...formData, vendedor_id: v.id})
                            setComboboxOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.vendedor_id === v.id ? "opacity-100" : "opacity-0")} />
                          {v.nombre}
                        </div>
                      ))}
                      
                      {vendedorSearch.trim().length > 0 && !hasExactMatch && (
                        <div
                          className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-[#5CC05A] hover:bg-muted font-medium mt-1"
                          onClick={() => handleCreateVendedor(vendedorSearch.trim())}
                        >
                          {creatingVendedor ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                          Agregar "{vendedorSearch.trim()}"
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Link (URL de publicación, Instagram, etc.)</Label>
              <Input 
                type="url"
                value={formData.link} 
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="https://..." 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Detalle / Información Adicional</Label>
              <Textarea 
                value={formData.info_credito} 
                onChange={(e) => setFormData({...formData, info_credito: e.target.value})}
                placeholder="Detalles adicionales, información sobre el crédito, etc..." 
                className="min-h-[80px]"
              />
            </div>
          </div>

          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#EAEAEA] bg-[#FBFBFA] mt-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#111111] text-[#FFFFFF] hover:bg-[#111111]/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Propiedad
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
