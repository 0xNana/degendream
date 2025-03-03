'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-accent/10 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Degen Dream
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A decentralized lottery powered by Chainlink VRF. 
            Bet in real-time with provably fair random numbers.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <Button 
              size="lg"
              onClick={() => router.push('/game')}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
            >
              Play Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 