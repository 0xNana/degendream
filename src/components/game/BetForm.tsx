'use client'

import { Button } from "@/components/ui/button"
import { useState, useCallback } from "react"
import { useDegenDream } from "@/hooks/useDegenDream"
import { formatEther, parseEther } from "viem"
import { toast } from "react-hot-toast"

const MIN_NUMBERS = 6
const MAX_NUMBERS = 6
const MIN_BET = parseEther('1')
const MAX_BET = parseEther('100')

export function BetForm() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<string>('1')
  const { handleBet, isProcessing: isLoading } = useDegenDream()

  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num)
      }
      if (prev.length >= MAX_NUMBERS) {
        return prev
      }
      return [...prev, num].sort((a, b) => a - b)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedNumbers.length !== MIN_NUMBERS) {
      toast.error(`Please select exactly ${MIN_NUMBERS} numbers`)
      return
    }

    const amount = parseEther(betAmount)
    if (amount < MIN_BET || amount > MAX_BET) {
      toast.error(`Bet amount must be between ${formatEther(MIN_BET)} and ${formatEther(MAX_BET)} DD`)
      return
    }

    try {
      await handleBet(amount, selectedNumbers)
      setSelectedNumbers([])
      setBetAmount('1')
    } catch (error) {
      console.error('Bet error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
          <Button
            key={num}
            type="button"
            size="sm"
            variant={selectedNumbers.includes(num) ? "default" : "outline"}
            onClick={() => toggleNumber(num)}
            disabled={isLoading || (selectedNumbers.length >= MAX_NUMBERS && !selectedNumbers.includes(num))}
          >
            {num}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          min={formatEther(MIN_BET)}
          max={formatEther(MAX_BET)}
          step="1"
          className="w-32 px-3 py-2 border rounded-md"
          disabled={isLoading}
        />
        <Button 
          type="submit"
          disabled={selectedNumbers.length !== MIN_NUMBERS || isLoading}
        >
          {isLoading ? 'Placing Bet...' : 'Place Bet'}
        </Button>
      </div>
    </form>
  )
} 