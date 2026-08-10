"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Search, Plus, Download, Upload, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Property, Vendedor, PropertyFilters } from "@/lib/types"
import { PROPERTY_TYPES, PROPERTY_FORMS, STATUS_OPTIONS, STATUS_COLORS, CREDIT_OPTIONS, KEYS_OPTIONS } from "@/lib/constants"
import PropertyTable from "@/components/property-table"
import PropertyFormDialog from "@/components/property-form-dialog"
import ImportDialog from "@/components/import-dialog"
import MultiSelectFilter from "@/components/multi-select-filter"
import { Slider } from "@/components/ui/slider"

function PriceFilterComponent({ filters, setFilters, properties }: { filters: any, setFilters: any, properties: Property[] }) {
  const [localPrice, setLocalPrice] = useState<{min: string, max: string}>({
    min: filters.precio_min || "",
    max: filters.precio_max || ""
  })

  useEffect(() => {
    if (filters.precio_min === "" && filters.precio_max === "") {
      setLocalPrice({min: "", max: ""})
    }
  }, [filters.precio_min, filters.precio_max])

  const [maxArsSeen, setMaxArsSeen] = useState<number>(100000000)

  useEffect(() => {
    const arsPrices = properties
      .filter(p => p.precio_moneda === "ARS" && p.precio_monto != null)
      .map(p => p.precio_monto as number);
    if (arsPrices.length > 0) {
      const currentMax = Math.max(...arsPrices);
      setMaxArsSeen(prev => Math.max(prev, Math.ceil(currentMax / 1000000) * 1000000));
    }
  }, [properties])

  const getSliderMax = () => filters.moneda === "USD" ? 500000 : maxArsSeen
  const getSliderStep = () => filters.moneda === "USD" ? 5000 : 1000000

  return (
    <div className="flex-1 w-full xl:w-auto flex flex-col justify-center max-w-2xl space-y-1">
      <span className="text-xs font-medium text-muted-foreground text-center xl:text-left ml-1">Filtro de Precio</span>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={filters.moneda || "Todas"} 
            onValueChange={(val) => {
              setFilters((f: any) => ({ ...f, moneda: val || "Todas", precio_min: "", precio_max: "" }))
              setLocalPrice({min: "", max: ""})
            }}
          >
            <SelectTrigger className="w-full sm:w-[90px]"><SelectValue placeholder="Moneda" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Moneda</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="text"
            inputMode="numeric"
            placeholder="Mínimo"
            value={localPrice.min}
            onChange={(e) => setLocalPrice(p => ({ ...p, min: e.target.value.replace(/\D/g, '') }))}
            disabled={!filters.moneda || filters.moneda === "Todas"}
            className="w-full"
          />
          <Input 
            type="text"
            inputMode="numeric"
            placeholder="Máximo"
            value={localPrice.max}
            onChange={(e) => setLocalPrice(p => ({ ...p, max: e.target.value.replace(/\D/g, '') }))}
            disabled={!filters.moneda || filters.moneda === "Todas"}
            className="w-full"
          />
          <Button 
            variant="default" 
            disabled={!filters.moneda || filters.moneda === "Todas"}
            onClick={() => setFilters((f: any) => ({ ...f, precio_min: localPrice.min, precio_max: localPrice.max }))}
          >
            Aplicar
          </Button>
        </div>
        {filters.moneda && filters.moneda !== "Todas" && (
          <div className="px-2">
            <Slider 
              value={[
                parseInt(localPrice.min) || 0,
                parseInt(localPrice.max) || getSliderMax()
              ]}
              min={0}
              max={getSliderMax()}
              step={getSliderStep()}
              onValueChange={(val) => {
                const arr = Array.isArray(val) ? val : [val, getSliderMax()];
                setLocalPrice({
                  min: arr[0] === 0 ? "" : arr[0].toString(),
                  max: arr[1] === getSliderMax() ? "" : arr[1].toString()
                })
              }}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState<{
    search: string;
    tipo: string[];
    forma: string[];
    estado: string;
    vendedor_id: string;
    apta_credito: string;
    dormitorios: string[];
    llaves: string;
    moneda: string;
    precio_min: string;
    precio_max: string;
  }>({
    search: "",
    tipo: [],
    forma: [],
    estado: "Todos",
    vendedor_id: "Todos",
    apta_credito: "Todos",
    dormitorios: [],
    llaves: "Todos",
    moneda: "USD",
    precio_min: "",
    precio_max: ""
  })
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search || ""), 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchProperties = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (filters.tipo && filters.tipo.length > 0) params.append("tipo", filters.tipo.join(","))
      if (filters.forma && filters.forma.length > 0) params.append("forma", filters.forma.join(","))
      if (filters.estado && filters.estado !== "Todos") params.append("estado", filters.estado)
      if (filters.vendedor_id && filters.vendedor_id !== "Todos") params.append("vendedor_id", filters.vendedor_id)
      if (filters.apta_credito && filters.apta_credito !== "Todos") params.append("apta_credito", filters.apta_credito)
      if (filters.dormitorios && filters.dormitorios.length > 0) params.append("dormitorios", filters.dormitorios.join(","))
      if (filters.llaves && filters.llaves !== "Todos") params.append("llaves", filters.llaves)
      if (filters.moneda && filters.moneda !== "Todas" && (filters.precio_min || filters.precio_max)) {
        params.append("moneda", filters.moneda)
        if (filters.precio_min) params.append("precio_min", filters.precio_min)
        if (filters.precio_max) params.append("precio_max", filters.precio_max)
      }

      const res = await fetch(`/api/propiedades?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProperties(data)
      } else {
        if (!silent) toast.error("Error al cargar propiedades")
      }
    } catch (error) {
      if (!silent) toast.error("Error de conexión al cargar propiedades")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [debouncedSearch, filters.tipo, filters.forma, filters.estado, filters.vendedor_id, filters.apta_credito, filters.dormitorios, filters.llaves, filters.moneda, filters.precio_min, filters.precio_max])

  const fetchVendedores = async () => {
    try {
      const res = await fetch("/api/vendedores")
      if (res.ok) {
        const data = await res.json()
        setVendedores(data)
      }
    } catch (error) {
      console.error("Error fetching vendedores", error)
    }
  }

  useEffect(() => {
    fetchVendedores()
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.append("search", debouncedSearch)
    if (filters.tipo && filters.tipo.length > 0) params.append("tipo", filters.tipo.join(","))
    if (filters.forma && filters.forma.length > 0) params.append("forma", filters.forma.join(","))
    if (filters.estado && filters.estado !== "Todos") params.append("estado", filters.estado)
    if (filters.vendedor_id && filters.vendedor_id !== "Todos") params.append("vendedor_id", filters.vendedor_id)
    if (filters.apta_credito && filters.apta_credito !== "Todos") params.append("apta_credito", filters.apta_credito)
    if (filters.dormitorios && filters.dormitorios.length > 0) params.append("dormitorios", filters.dormitorios.join(","))
    if (filters.llaves && filters.llaves !== "Todos") params.append("llaves", filters.llaves)
    if (filters.moneda && filters.moneda !== "Todas" && (filters.precio_min || filters.precio_max)) {
      params.append("moneda", filters.moneda)
      if (filters.precio_min) params.append("precio_min", filters.precio_min)
      if (filters.precio_max) params.append("precio_max", filters.precio_max)
    }

    window.open(`/api/propiedades/export?${params.toString()}`, '_blank')
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/propiedades/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Propiedad eliminada")
        fetchProperties(true)
      } else {
        toast.error("Error al eliminar la propiedad")
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar")
    }
  }

  const isFiltered = !!(debouncedSearch || (filters.tipo && filters.tipo.length > 0) || (filters.forma && filters.forma.length > 0) || (filters.estado && filters.estado !== "Todos") || (filters.vendedor_id && filters.vendedor_id !== "Todos") || (filters.apta_credito && filters.apta_credito !== "Todos") || (filters.dormitorios && filters.dormitorios.length > 0) || (filters.llaves && filters.llaves !== "Todos") || filters.precio_min || filters.precio_max)

  const resetFilters = () => {
    setFilters({
      search: "",
      tipo: [],
      forma: [],
      estado: "Todos",
      vendedor_id: "Todos",
      apta_credito: "Todos",
      dormitorios: [],
      llaves: "Todos",
      moneda: "USD",
      precio_min: "",
      precio_max: ""
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EAEAEA] shadow-sm space-y-4">
        
        {/* Row 1: 8 Basic Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Búsqueda libre</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-9"
                value={filters.search || ""}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Estado</span>
            <Select value={filters.estado || "Todos"} onValueChange={(val) => setFilters(f => ({ ...f, estado: val || "Todos" }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estados</SelectItem>
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
          
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Tipo de Propiedad</span>
            <MultiSelectFilter
              title="Tipo de Propiedad"
              placeholder="Todos los tipos"
              options={PROPERTY_TYPES.map(t => ({ value: t, label: t }))}
              value={filters.tipo}
              onChange={(vals) => setFilters(f => ({ ...f, tipo: vals }))}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Forma de Operación</span>
            <MultiSelectFilter
              title="Forma de Operación"
              placeholder="Todas las formas"
              options={PROPERTY_FORMS.map(f => ({ value: f, label: f }))}
              value={filters.forma}
              onChange={(vals) => setFilters(f => ({ ...f, forma: vals }))}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Apta Crédito</span>
            <Select value={filters.apta_credito || "Todos"} onValueChange={(val) => setFilters(f => ({ ...f, apta_credito: val || "Todos" }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Crédito" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas</SelectItem>
                {CREDIT_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Dormitorios</span>
            <MultiSelectFilter
              title="Dormitorios"
              placeholder="Todos"
              options={Array.from({ length: 11 }).map((_, i) => ({ value: i.toString(), label: i === 0 ? "Monoambiente" : i.toString() }))}
              value={filters.dormitorios}
              onChange={(vals) => setFilters(f => ({ ...f, dormitorios: vals }))}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Llaves</span>
            <Select value={filters.llaves || "Todos"} onValueChange={(val) => setFilters(f => ({ ...f, llaves: val || "Todos" }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Llaves" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas</SelectItem>
                {KEYS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Vendedor</span>
            <Select value={filters.vendedor_id || "Todos"} onValueChange={(val) => setFilters(f => ({ ...f, vendedor_id: val || "Todos" }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vendedor">
                  {filters.vendedor_id && filters.vendedor_id !== "Todos" 
                    ? (vendedores.find(v => v.id.toString() === filters.vendedor_id)?.nombre || "Vendedor")
                    : "Todos los vendedores"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los vendedores</SelectItem>
                {vendedores.map(v => (
                  <SelectItem key={v.id} value={v.id.toString()}>{v.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Info, Price Filter, Actions */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 border-t border-[#EAEAEA] pt-4 mt-4">
          
          {/* Left: Info */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-center xl:justify-start">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
              {properties.length} propiedades {isFiltered ? 'filtradas' : ''}
            </Badge>
            
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2">
                <FilterX className="w-4 h-4" />
                Limpiar filtros
              </Button>
            )}
            
            <div className="relative group">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 cursor-default bg-white">
                Estados
              </Button>
              <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-[#EAEAEA] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Leyenda de colores</p>
                  {STATUS_OPTIONS.map(s => {
                    const color = STATUS_COLORS[s.value];
                    return (
                      <div key={s.value} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color?.border || '#ccc' }} />
                        <span className="truncate">{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Price Filter */}
          <PriceFilterComponent filters={filters} setFilters={setFilters} properties={properties} />

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-center xl:justify-end">
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {isFiltered ? "Exportar filtrado" : "Exportar todo"}
            </Button>
            <Button 
              className="bg-[#5CC05A] hover:bg-[#5CC05A]/90 text-white"
              onClick={() => {
                setSelectedProperty(null)
                setShowForm(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Propiedad
            </Button>
          </div>

        </div>
      </div>

      {/* Table / Cards */}
      <PropertyTable 
        properties={properties} 
        loading={loading} 
        onEdit={(prop) => {
          setSelectedProperty(prop)
          setShowForm(true)
        }}
        onDelete={handleDelete}
      />

      {/* Dialogs */}
      {showForm && (
        <PropertyFormDialog 
          open={showForm} 
          onOpenChange={setShowForm}
          property={selectedProperty}
          vendedores={vendedores}
          onSuccess={() => {
            fetchProperties(true)
            fetchVendedores() // Refresh in case a new one was added
          }}
        />
      )}

      {showImport && (
        <ImportDialog 
          open={showImport} 
          onOpenChange={setShowImport}
          onSuccess={() => {
            fetchProperties(true)
            fetchVendedores()
          }}
        />
      )}
    </div>
  )
}
