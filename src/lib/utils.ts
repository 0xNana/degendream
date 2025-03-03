import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "react-hot-toast"
import { type Hash } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extended notify function with loading and success methods
export const notify = (message: string, type: 'success' | 'error' = 'success') => {
  toast[type](message)
}

export function handleTxError(error: unknown) {
  console.error('Transaction error:', error)
  if (error instanceof Error) {
    notify(error.message, 'error')
  } else {
    notify('Transaction failed. Please try again.', 'error')
  }
}

export const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  const prefix = address.slice(0, 2) === '0x' ? '0x' : ''
  const start = address.slice(prefix.length, prefix.length + chars)
  const end = address.slice(-chars)
  return `${prefix}${start}...${end}`
}

export function generateUserId(address: string | undefined | null): string {
  if (!address) return 'DegenUnknown'
  
  try {
    // Make sure address is at least 10 characters long (0x + 8 chars)
    if (address.length < 10) return 'DegenInvalid'
    
    // Take first 4 chars after '0x' and last 4 chars
    const start = address.slice(2, 6)
    const end = address.slice(-4)
    return `Degen${start}${end}`
  } catch (error) {
    console.warn('Error generating user ID:', error)
    return 'DegenError'
  }
}

export function formatBetId(betId: bigint | string): string {
  const id = betId.toString()
  return `#${id.slice(-4)}` // Takes last 4 digits
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // If less than 24 hours, show relative time
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}m ago`
    }
    return `${hours}h ago`
  }
  
  // Otherwise show date
  return date.toLocaleDateString()
} 