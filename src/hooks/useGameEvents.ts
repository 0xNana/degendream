import { useWatchContractEvent } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import confetti from 'canvas-confetti'

export interface GameEvent {
  requestId: bigint
  player: string
  amount: bigint
  numbers: number[]
  timestamp: number
}

export interface DrawResult {
  requestId: bigint
  numbers: number[]
  timestamp: number
}

export interface PrizeResult {
  requestId: bigint
  player: string
  amount: bigint
  matches: number
  timestamp: number
}

export function useGameEvents() {
  const [latestBet, setLatestBet] = useState<GameEvent>()
  const [latestDraw, setLatestDraw] = useState<DrawResult>()
  const [latestPrize, setLatestPrize] = useState<PrizeResult>()
  const [events, setEvents] = useState<any[]>([])

  // Handle win celebration
  const celebrateWin = useCallback((matches: number) => {
    if (matches >= 3) {
      confetti({
        particleCount: matches * 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [])

  const handleEvent = useCallback((event: any) => {
    setEvents(prev => [event, ...prev])
    toast.success('New game event occurred!')
  }, [])

  // Listen for new bets
  useWatchContractEvent({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: CONTRACTS.DEGEN_DREAM.abi,
    eventName: 'BetPlaced',
    onLogs: handleEvent
  })

  // Listen for numbers being drawn
  useWatchContractEvent({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: CONTRACTS.DEGEN_DREAM.abi,
    eventName: 'NumbersDrawn',
    onLogs: handleEvent
  })

  // Listen for prizes being awarded
  useWatchContractEvent({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: CONTRACTS.DEGEN_DREAM.abi,
    eventName: 'PrizeAwarded',
    onLogs: handleEvent
  })

  return {
    latestBet,
    latestDraw,
    latestPrize,
    events
  }
} 