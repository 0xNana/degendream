'use client'

import { motion } from 'framer-motion'
import { Users, Trophy, Coins, Network } from 'lucide-react'

export function LiveStats() {
  return (
    <div className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl lg:max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <dl className="grid grid-cols-1 gap-y-16 gap-x-8 text-center lg:grid-cols-4">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Total Bets</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  100K+
                </div>
              </dd>
            </div>

            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Active Users</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500" />
                  20K+
                </div>
              </dd>
            </div>

            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Total Volume</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                <div className="flex items-center justify-center gap-2">
                  <Coins className="h-6 w-6 text-purple-500" />
                  $10M+
                </div>
              </dd>
            </div>

            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-muted-foreground">Supported Chains</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                <div className="flex items-center justify-center gap-2">
                  <Network className="h-6 w-6 text-pink-500" />
                  5+
                </div>
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </div>
  )
} 