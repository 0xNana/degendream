'use client'

import { ReactNode } from 'react'
import { formatEther } from 'viem'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDegenDream } from '@/hooks/useDegenDream'

// Define proper types for the betting history
interface Bet {
  requestId: bigint
  timestamp: number
  amount: bigint
  payout: bigint
  won: boolean
  processed: boolean
  matches: number
  numbers: number[]
}

interface HistoryProps {
  bets: Bet[]
}

export function BettingHistory({ bets }: HistoryProps) {
  const { totalGames, gamesWon, totalWinnings } = useDegenDream()

  return (
    <Card className="p-4">
      {/* Summary Section */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <h4 className="text-sm text-muted-foreground">Total Bets</h4>
            <p className="text-xl font-bold">{totalGames}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Wins</h4>
            <p className="text-xl font-bold text-green-500">
              {gamesWon} ({totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(0) : 0}%)
            </p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Total Winnings</h4>
            <p className="text-xl font-bold">{formatEther(totalWinnings)} DD</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Betting History</h3>
      {bets && bets.length > 0 ? (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {bets.map((bet) => (
              <motion.div
                key={bet.requestId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-lg"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">
                      Bet #{bet.requestId.toString()}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {new Date(bet.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${!bet.processed 
                      ? 'bg-yellow-500/10 text-yellow-500' 
                      : bet.won 
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }
                  `}>
                    {!bet.processed 
                      ? 'Pending'
                      : bet.won 
                        ? `Won ${formatEther(bet.payout)} DD`
                        : 'Lost'
                    }
                  </div>
                </div>

                {/* Bet Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatEther(bet.amount)} DD</span>
                  </div>
                  
                  {bet.processed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Matches</span>
                      <span className="font-medium">{bet.matches}/6</span>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Selected Numbers</span>
                    <div className="flex flex-wrap gap-2">
                      {bet.numbers.map((number: number, idx: number) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No bets placed yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Place your first bet to start your betting history
          </p>
        </div>
      )}
    </Card>
  )
} 