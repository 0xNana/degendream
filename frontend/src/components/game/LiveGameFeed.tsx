'use client'

import { useGameEvents } from '@/hooks/useGameEvents'
import { formatEther } from 'viem'
import { truncateAddress } from '@/lib/utils'

export function LiveGameFeed() {
  const { latestBet, latestDraw, latestPrize } = useGameEvents()

  return (
    <div className="space-y-4">
      {latestBet && (
        <div className="animate-pulse">
          <h3>Latest Bet 🎲</h3>
          <p>{truncateAddress(latestBet.player)}</p>
          <p>{formatEther(latestBet.amount)} DD</p>
          <p>Numbers: {latestBet.numbers.join(', ')}</p>
        </div>
      )}

      {latestPrize && latestPrize.matches > 0 && (
        <div className="animate-bounce">
          <h3>Winner! 🏆</h3>
          <p>{truncateAddress(latestPrize.player)}</p>
          <p>{formatEther(latestPrize.amount)} DD</p>
          <p>Matches: {latestPrize.matches}</p>
        </div>
      )}
    </div>
  )
} 