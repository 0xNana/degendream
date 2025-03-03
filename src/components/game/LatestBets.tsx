'use client'

import { useLatestBets, type Bet } from '@/hooks/useLatestBets'
import { motion } from 'framer-motion'
import { truncateAddress } from '@/lib/utils'

const BetStatusBadge = ({ processed, won }: { processed: boolean; won: boolean }) => {
  let status: string
  let colorClass: string

  if (!processed) {
    status = 'Pending'
    colorClass = 'bg-yellow-500/10 text-yellow-500'
  } else if (won) {
    status = 'Won'
    colorClass = 'bg-green-500/10 text-green-500'
  } else {
    status = 'Lost'
    colorClass = 'bg-red-500/10 text-red-500'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}

export function LatestBets() {
  const { bets } = useLatestBets()

  if (!bets.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No bets placed yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Latest Bets 🎲</h3>
      <div className="space-y-2">
        {bets.map((bet, index) => (
          <motion.div
            key={`${bet.player}-${bet.timestamp}-${bet.requestId.toString()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-muted/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium block">
                  {truncateAddress(bet.player)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {bet.amount} DD
                </span>
              </div>
              <BetStatusBadge processed={bet.processed} won={bet.won} />
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-1">
                {bet.numbers.map((num, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10"
                  >
                    {num}
                  </span>
                ))}
              </div>
              <div className="mt-1">
                {new Date(bet.timestamp * 1000).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 