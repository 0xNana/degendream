'use client'

import { useDegenDream } from '@/hooks/useDegenDream'
import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { shortenAddress, formatBetId, formatTimestamp } from '@/lib/utils'

export function MyBets() {
  const { bettingHistory } = useDegenDream()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="animate-pulse h-[200px] bg-muted rounded-lg" />
  }

  if (!bettingHistory?.length) {
    return (
      <div className="text-center p-4">
        <h2 className="text-lg font-semibold mb-2">Your Bets</h2>
        <p className="text-muted-foreground">No bets placed yet</p>
      </div>
    )
  }

  return (
    <Card className="h-[520px]">
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold p-4 pb-2">My Bets</h2>
        <ScrollArea className="flex-1">
          <div className="space-y-3 px-4 pb-4">
            {bettingHistory && bettingHistory.length > 0 ? (
              bettingHistory.map((bet) => (
                <motion.div
                  key={bet.requestId.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatBetId(bet.requestId)}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(bet.timestamp)}
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

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{formatEther(bet.amount)} DD</span>
                    </div>
                    
                    {bet.processed && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Matches</span>
                        <span>{bet.matches}/6</span>
                      </div>
                    )}

                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Your Numbers</span>
                      <div className="flex flex-wrap gap-1">
                        {bet.selectedNumbers.map((number, idx) => (
                          <div
                            key={idx}
                            className={`
                              w-6 h-6 text-xs rounded-full flex items-center justify-center font-medium
                              ${bet.processed && bet.winningNumbers.includes(number)
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-muted'
                              }
                            `}
                          >
                            {number}
                          </div>
                        ))}
                      </div>
                    </div>

                    {bet.processed && bet.winningNumbers.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Winning Numbers</span>
                        <div className="flex flex-wrap gap-1">
                          {bet.winningNumbers.map((number, idx) => (
                            <div
                              key={idx}
                              className={`
                                w-6 h-6 text-xs rounded-full flex items-center justify-center font-medium
                                ${bet.selectedNumbers.includes(number)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-primary text-primary-foreground'
                                }
                              `}
                            >
                              {number}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bets placed yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Place your first bet to start your betting history
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
} 