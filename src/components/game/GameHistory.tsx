'use client'

import { useGameResults } from '@/hooks/useGameResults'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

// Define the status type to match what comes from useGameResults
type GameStatus = 'pending' | 'won' | 'lost'

export function GameHistory() {
  const { results } = useGameResults()

  const getStatusStyle = (status: GameStatus) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500/20 bg-yellow-500/10'
      case 'won':
        return 'border-green-500/20 bg-green-500/10'
      case 'lost':
        return 'border-red-500/20 bg-red-500/10'
      default:
        return 'border-muted bg-muted/10'
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Game History</h2>
      
      <div className="space-y-2">
        <AnimatePresence>
          {results.map((result) => (
            <motion.div
              key={result.requestId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-4 rounded-lg border ${getStatusStyle(result.status as GameStatus)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">
                    Your Numbers: {result.numbers.join(', ')}
                  </p>
                  {result.winningNumbers.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Winning Numbers: {result.winningNumbers.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {(result.status as GameStatus) === 'pending' ? (
                    <span className="text-yellow-500">Pending</span>
                  ) : (
                    <>
                      <p className="font-medium">
                        {result.matches} matches
                      </p>
                      {BigInt(result.payout) > 0 && (
                        <p className="text-sm text-green-500">
                          Won {formatEther(result.payout)} DREAM
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {results.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No games played yet
          </p>
        )}
      </div>
    </div>
  )
} 