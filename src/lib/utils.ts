import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with thousand separators and decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return '0'
  }

  // For large numbers, show with appropriate suffix
  if (Math.abs(numValue) >= 1000000) {
    return (numValue / 1000000).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }) + 'M'
  }
  
  if (Math.abs(numValue) >= 1000) {
    return (numValue / 1000).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }) + 'K'
  }

  // For smaller numbers, show with specified decimal places
  return numValue.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  })
}
