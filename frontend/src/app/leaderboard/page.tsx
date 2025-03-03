'use client'

import { Container } from "@/components/layout/Container"
import { motion } from 'framer-motion'

export default function LeaderboardPage() {
  return (
    <Container className="py-24">
      <motion.div 
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Leaderboard
        </h1>
        <p className="text-2xl text-muted-foreground">
          Coming Soon
        </p>
      </motion.div>
    </Container>
  )
} 