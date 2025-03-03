'use client'

import { useDegenDream } from '@/hooks/useDegenDream'
import { formatEther } from 'viem'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatBetId, formatTimestamp, truncateAddress } from '@/lib/utils'

export function BetsHistory() {
  const { globalActivity } = useDegenDream()
  const bets = globalActivity.filter(activity => activity.type === 'bet_placed')

  return (
    <div className="h-[600px]">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Recent Bets</h2>
      </div>
      
      <ScrollArea className="h-[calc(600px-57px)]">
        <div className="p-4 space-y-4">
          {bets.map((bet) => (
            <motion.div
              key={bet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-medium">{formatBetId(bet.id)}</span>
                  <span className="text-xs text-muted-foreground block">
                    {formatTimestamp(bet.timestamp)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    {truncateAddress(bet.player as `0x${string}`)}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {formatEther(bet.amount || BigInt(0))} DD
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground block mb-2">Selected Numbers</span>
                <div className="flex flex-wrap gap-1">
                  {bet.numbers.map((number, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium"
                    >
                      {number}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 