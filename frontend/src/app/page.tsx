import { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { HowItWorks } from '@/components/home/HowItWorks'
import { LiveStats } from '@/components/home/LiveStats'

export const metadata: Metadata = {
  title: 'Degen Dream | Decentralized Lottery',
  description: 'Decentralized lottery powered by Chainlink VRF. Bet in real-time with provably fair random numbers.',
}

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <LiveStats />
      <Features />
      <HowItWorks />
    </main>
  )
}
