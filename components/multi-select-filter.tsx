"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  title: string
  placeholder: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
}

export default function MultiSelectFilter({ title, placeholder, options, value, onChange }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const isAllSelected = options.length > 0 && value.length === options.length

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([])
    } else {
      onChange(options.map(o => o.value))
    }
  }

  const displayText = () => {
    if (value.length === 0) return placeholder
    if (isAllSelected) return "Todos"
    if (value.length <= 2) {
      return value
        .map(v => options.find(o => o.value === v)?.label ?? v)
        .join(", ")
    }
    return `${value.length} seleccionados`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal cursor-pointer">
          <span className="truncate">{displayText()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={toggleAll}
                className="text-[#5CC05A] cursor-pointer"
              >
                {isAllSelected ? "Quitar todos" : "Seleccionar todos"}
              </Button>
              {value.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onChange([])}
                  title="Borrar todos"
                  className="text-muted-foreground cursor-pointer"
                >
                  <X />
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto p-1">
            {options.map(option => {
              const checked = value.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                    checked && "bg-muted/60"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 shrink-0 rounded border-muted-foreground/40 accent-[#5CC05A]"
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
