'use client'

import { motion } from 'framer-motion'
import { Wallet, Dices, Award } from 'lucide-react'

const steps = [
  {
    title: 'Connect Wallet',
    description: 'Connect your wallet to get started. We support multiple chains and wallets.',
    icon: Wallet,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Place Your Bet',
    description: 'Choose your numbers and place your bet. Chainlink VRF ensures fair random number generation.',
    icon: Dices,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Win Rewards',
    description: 'Match numbers to win up to 100x your bet.',
    icon: Award,
    color: 'from-pink-500 to-pink-600'
  }
]

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Getting Started
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            How to Play
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start playing in minutes. It's easy, secure, and completely decentralized.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-3 lg:gap-x-16 mx-auto px-4 lg:px-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-start"
              >
                <div className={`rounded-lg bg-gradient-to-b ${step.color} p-2`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <dt className="mt-4 font-semibold">{step.title}</dt>
                <dd className="mt-2 leading-7 text-muted-foreground">
                  {step.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 