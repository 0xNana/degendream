'use client'

import { motion } from 'framer-motion'

export function GameLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <motion.div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.p 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Loading game...
      </motion.p>
    </div>
  )
} 