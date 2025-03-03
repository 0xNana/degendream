import { degenDreamAbi } from './abis/degenDream'
import { degenTokenAbi } from './abis/degenToken'

if (!process.env.NEXT_PUBLIC_DEGEN_DREAM_ADDRESS) {
  throw new Error('NEXT_PUBLIC_DEGEN_DREAM_ADDRESS not set')
}

if (!process.env.NEXT_PUBLIC_DEGEN_TOKEN_ADDRESS) {
  throw new Error('NEXT_PUBLIC_DEGEN_TOKEN_ADDRESS not set')
}

export const CONTRACTS = {
  DEGEN_DREAM: {
    address: process.env.NEXT_PUBLIC_DEGEN_DREAM_ADDRESS as `0x${string}`,
    abi: degenDreamAbi,
  },
  DEGEN_TOKEN: {
    address: process.env.NEXT_PUBLIC_DEGEN_TOKEN_ADDRESS as `0x${string}`,
    abi: degenTokenAbi,
  },
} as const

// Add lowercase contracts export for consistency
export const contracts = {
  degenToken: CONTRACTS.DEGEN_TOKEN,
  degenDream: CONTRACTS.DEGEN_DREAM
} as const

// Type for contract configurations
export type ContractConfig = typeof CONTRACTS 

export const SUPPORTED_CHAINS = ['sepolia', 'mainnet'] as const 