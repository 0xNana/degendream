'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { useRouter } from 'next/navigation' // Unused import

export function GameErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    console.error('Game error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Try again
      </button>
    </div>
  )
} 