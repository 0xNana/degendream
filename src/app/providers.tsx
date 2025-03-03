'use client'

import { ReactNode, useState, useEffect } from 'react'
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { LeaderboardProvider } from "@/components/providers/LeaderboardProvider"
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/wagmi'
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter } from '@/config/wagmi'

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  networks: [wagmiAdapter.networks[0]] // Use the first network from wagmi adapter
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LeaderboardProvider>
            <TooltipProvider>
              {mounted ? children : null}
              </TooltipProvider>
            </LeaderboardProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 