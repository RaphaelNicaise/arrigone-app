"use client"

import { useState, useMemo } from "react"
import { Property, PropertyStatus } from "@/lib/types"
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit2, Trash2, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PropertyTableProps {
  properties: Property[]
  loading: boolean
  onEdit: (property: Property) => void
  onDelete: (id: string) => void
}

export default function PropertyTable({ properties, loading, onEdit, onDelete }: PropertyTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Property | 'vendedor.nombre'; direction: 'asc' | 'desc' } | null>({ key: 'direccion', direction: 'asc' })

  const sortedProperties = useMemo(() => {
    if (!sortConfig) return properties
    
    return [...properties].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Property]
      let bValue: any = b[sortConfig.key as keyof Property]
      
      if (sortConfig.key === 'vendedor.nombre') {
        aValue = a.vendedor?.nombre || ''
        bValue = b.vendedor?.nombre || ''
      }
      
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [properties, sortConfig])

  const handleSort = (key: keyof Property | 'vendedor.nombre') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
    if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  const formatPrice = (prop: Property) => {
    if (prop.precio_no_disponible) return 'N/D'
    if (prop.precio_monto != null) {
      const formatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
      const currency = (prop.precio_moneda === 'USD' || prop.precio_moneda === 'ARS') ? prop.precio_moneda + ' ' : '';
      return `${currency}${formatter.format(prop.precio_monto)}`;
    }
    return prop.precio_moneda || '-'
  }

  const getStatusLabel = (estado: PropertyStatus) => {
    return STATUS_OPTIONS.find(s => s.value === estado)?.label || estado
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="hidden md:block bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dirección</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Apta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Dorm.</TableHead>
                <TableHead>Llaves</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-[#EAEAEA] space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <div className="grid grid-cols-2 gap-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#EAEAEA] p-12 text-center text-muted-foreground">
        No se encontraron propiedades.
      </div>
    )
  }



  const openLink = (link: string | null) => {
    if (!link) return
    let url = link
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow style={{ borderLeft: '3px solid transparent' }}>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('direccion')}>
                <div className="flex items-center">Dirección <SortIcon columnKey="direccion" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('tipo')}>
                <div className="flex items-center">Tipo <SortIcon columnKey="tipo" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('forma')}>
                <div className="flex items-center">Forma <SortIcon columnKey="forma" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('apta_credito')}>
                <div className="flex items-center">Apta <SortIcon columnKey="apta_credito" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('fecha')}>
                <div className="flex items-center">Fecha <SortIcon columnKey="fecha" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('precio_moneda')}>
                <div className="flex items-center">Precio <SortIcon columnKey="precio_moneda" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('dormitorios')}>
                <div className="flex items-center">Dorm. <SortIcon columnKey="dormitorios" /></div>
              </TableHead>
              <TableHead>Llaves</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('vendedor.nombre')}>
                <div className="flex items-center">Vendedor <SortIcon columnKey="vendedor.nombre" /></div>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProperties.map((prop) => {
              const statusStyle = STATUS_COLORS[prop.estado || 'No disponible'] || { bg: 'transparent', border: '#ccc', text: 'inherit' }
              return (
                <TableRow 
                  key={prop.id} 
                  className="group hover:!bg-slate-100 transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: statusStyle.bg,
                    borderLeft: `3px solid ${statusStyle.border}` 
                  }}
                  onClick={() => onEdit(prop)}
                >
                  <TableCell className="font-medium">{prop.direccion || '-'}</TableCell>
                  <TableCell>{prop.tipo || '-'}</TableCell>
                  <TableCell>{prop.forma || '-'}</TableCell>
                  <TableCell>{prop.apta_credito || '-'}</TableCell>
                  <TableCell className="max-w-[120px] truncate" title={prop.fecha || ''}>{prop.fecha || '-'}</TableCell>
                  <TableCell className="max-w-[150px] font-semibold truncate" title={formatPrice(prop)}>{formatPrice(prop)}</TableCell>
                  <TableCell>{prop.dormitorios || '-'}</TableCell>
                  <TableCell>{prop.llaves || '-'}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={prop.info_credito || ''}>{prop.info_credito || '-'}</TableCell>
                  <TableCell>{prop.vendedor?.nombre || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {prop.link && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Abrir enlace" onClick={() => openLink(prop.link)}>
                          <ExternalLink className="h-4 w-4 pointer-events-none" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer" title="Eliminar propiedad">
                            <Trash2 className="h-4 w-4 pointer-events-none" />
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{prop.direccion}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(prop.id as string)} className="bg-destructive text-destructive-foreground">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {sortedProperties.map((prop) => {
          const statusStyle = STATUS_COLORS[prop.estado || 'No disponible'] || { bg: 'transparent', border: '#ccc', text: 'inherit' }
          return (
            <div 
              key={prop.id}
              className="bg-white rounded-xl border border-[#EAEAEA] p-4 space-y-3 cursor-pointer hover:shadow-sm transition-shadow relative overflow-hidden"
              style={{ 
                backgroundColor: statusStyle.bg,
                borderLeft: `3px solid ${statusStyle.border}` 
              }}
              onClick={() => onEdit(prop)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusStyle.border }} />
                  <span className="font-medium text-sm" style={{ color: statusStyle.text }}>{getStatusLabel(prop.estado)}</span>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {prop.link && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Abrir enlace" onClick={() => openLink(prop.link)}>
                      <ExternalLink className="h-4 w-4 pointer-events-none" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive cursor-pointer" title="Eliminar propiedad">
                        <Trash2 className="h-4 w-4 pointer-events-none" />
                      </Button>
                    } />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
                        <AlertDialogDescription>¿Eliminar permanentemente esta propiedad?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(prop.id as string)} className="bg-destructive">Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg leading-tight mb-1">{prop.direccion}</h3>
                <p className="text-muted-foreground text-sm">{prop.tipo} • {prop.forma}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-black/5">
                <div>
                  <span className="text-muted-foreground block text-xs">Precio</span>
                  <span className="font-semibold">{formatPrice(prop)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Vendedor</span>
                  <span className="truncate block">{prop.vendedor?.nombre || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Fecha</span>
                  <span className="block truncate" title={prop.fecha || ''}>{prop.fecha || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Llaves</span>
                  <span className="block">{prop.llaves || '-'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
