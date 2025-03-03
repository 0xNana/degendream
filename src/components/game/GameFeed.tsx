'use client'

import { useDegenDream } from '@/hooks/useDegenDream'
import { formatEther } from 'viem'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { truncateAddress } from '@/lib/utils'

interface GameActivity {
  id: string
  type: 'bet_placed' | 'numbers_drawn'
  timestamp: number
  numbers: number[]
  player?: string    // Optional for numbers_drawn events
  amount?: bigint    // Optional for numbers_drawn events
}

export function GameFeed() {
  const { globalActivity } = useDegenDream()

  return (
    <div className="h-[600px]">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {globalActivity.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">
                  {activity.type === 'bet_placed' ? 'New Bet' : 'Winning Numbers'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp * 1000).toLocaleString()}
                </span>
              </div>

              {activity.type === 'bet_placed' && activity.player && activity.amount && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Player</span>
                    <span className="font-medium">{truncateAddress(activity.player)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span>{formatEther(activity.amount)} DD</span>
                  </div>
                </>
              )}

              <div>
                <span className="text-sm text-muted-foreground block mb-2">
                  {activity.type === 'bet_placed' ? 'Selected Numbers' : 'Winning Numbers'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {activity.numbers.map((number, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-6 text-xs rounded-full flex items-center justify-center font-medium
                        ${activity.type === 'bet_placed' 
                          ? 'bg-primary/10' 
                          : 'bg-primary text-primary-foreground'}`}
                    >
                      {number}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {globalActivity.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No bets placed yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 