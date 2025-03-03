import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { createPublicClient, http as viemHttp } from 'viem'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Create the public client
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: viemHttp(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
})

const metadata = {
  name: 'DegenDream',
  description: 'DegenDream Game',
  url: 'https://degendream.com',
  icons: ['https://degendream.com/favicon.ico']
}

// Create connectors
const connectors = [
  walletConnect({ 
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, 
    metadata,
    showQrModal: false 
  }),
  injected({ 
    shimDisconnect: true 
  })
]

// Create wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
  },
  connectors,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  networks: [sepolia]
})

// Export wagmi config
export const config = wagmiAdapter.wagmiConfig 