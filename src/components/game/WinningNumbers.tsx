'use client'

import { useDegenDream } from '@/hooks/useDegenDream'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatTimestamp } from '@/lib/utils'

export function WinningNumbers() {
  const { globalActivity } = useDegenDream()
  const draws = globalActivity.filter(activity => activity.type === 'numbers_drawn')

  return (
    <div className="h-[600px]">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Winning Numbers</h2>
      </div>
      
      <ScrollArea className="h-[calc(600px-57px)]">
        <div className="p-4 space-y-4">
          {draws.map((draw) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(draw.timestamp)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {draw.numbers.map((number, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 