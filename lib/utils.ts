import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function formatDate(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 73050) {
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + value * 86400000)
      if (!isNaN(date.getTime())) {
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
      }
    }
    return String(value)
  }

  const str = String(value).trim()
  if (!str) return ''

  let match: RegExpMatchArray | null

  match = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10)
    const day = parseInt(match[3], 10)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${pad(day)}/${pad(month)}/${year}`
    }
  }

  match = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (match) {
    const day = parseInt(match[1], 10)
    const month = parseInt(match[2], 10)
    const year = parseInt(match[3], 10)
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${pad(day)}/${pad(month)}/${year}`
    }
  }

  const date = new Date(str)
  if (!isNaN(date.getTime())) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
  }

  return String(value)
}
