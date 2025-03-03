'use client'

import { useState, useCallback } from 'react'
import { NumberGrid } from './NumberGrid'
import { BettingInterface } from './BettingInterface'
import { useDegenDream } from '@/hooks/useDegenDream'

interface GameClientProps {
  onNumbersChange?: (numbers: number[]) => void
}

export function GameClient({ onNumbersChange }: GameClientProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const { isProcessing } = useDegenDream()

  const handleSelectionChange = useCallback((numbers: number[]) => {
    setSelectedNumbers(numbers)
    onNumbersChange?.(numbers)
  }, [onNumbersChange])

  const handleBetComplete = useCallback(() => {
    setSelectedNumbers([])
    onNumbersChange?.([])
  }, [onNumbersChange])

  return (
    <div className="space-y-6">
      <NumberGrid
        selectedNumbers={selectedNumbers}
        onSelectionChange={handleSelectionChange}
        disabled={isProcessing}
      />
      
      <BettingInterface
        selectedNumbers={selectedNumbers}
        onBetComplete={handleBetComplete}
      />
    </div>
  )
} 