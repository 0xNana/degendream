'use client'

import { useState } from 'react'
// Remove unused imports
// import { usePublicClient } from 'wagmi'
// import { formatEther } from 'viem'
// import { contracts } from '@/config/wagmi'

// Define proper types for the API response
interface GameResultResponse {
  timestamp: number
  numbers: number[]
  matches: number
  payout: string
}

export function useGameResults() {
  const [results, setResults] = useState<GameResult[]>([])

  type GameResult = {
    winningNumbers: any
    requestId: string | null | undefined
    timestamp: number
    numbers: number[]
    matches: number
    payout: bigint
    status: 'won' | 'lost'
  }

  const processResult = (result: GameResultResponse) => {
    return {
      timestamp: result.timestamp,
      numbers: result.numbers,
      matches: result.matches,
      payout: BigInt(result.payout),
      status: Number(result.payout) > 0 ? 'won' : 'lost'
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()
      
      const processedResults = data.map((result: GameResultResponse) => {
        return processResult(result)
      })

      setResults(processedResults)
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  return {
    results,
    fetchResults
  }
} 