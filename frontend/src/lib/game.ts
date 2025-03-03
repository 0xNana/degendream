import { CONTRACTS } from '@/config/contracts'
import { publicClient } from '@/config/wagmi'
import { formatEther } from 'viem'

export interface GameData {
  startTime: number
  endTime: number
  prizePool: string
  playerCount: number
  isActive: boolean
}

export async function getGameData(): Promise<GameData | null> {
  try {
    // Get player count and prize pool
    const [prizePool, playerCount] = await Promise.all([
      publicClient.readContract({
        address: CONTRACTS.DEGEN_TOKEN.address,
        abi: CONTRACTS.DEGEN_TOKEN.abi,
        functionName: 'balanceOf',
        args: [CONTRACTS.DEGEN_DREAM.address]
      }),
      publicClient.readContract({
        address: CONTRACTS.DEGEN_DREAM.address,
        abi: CONTRACTS.DEGEN_DREAM.abi,
        functionName: 'getPlayerCount',
        args: undefined
      })
    ])

    // Get current timestamp
    const now = Math.floor(Date.now() / 1000)

    return {
      startTime: now, // Current time as start
      endTime: now + (24 * 60 * 60), // 24 hours from now
      prizePool: formatEther(prizePool),
      playerCount: Number(playerCount),
      isActive: true // Always active for now
    }
  } catch (error) {
    console.error('Error fetching game data:', error)
    return null
  }
}

export async function validateGame(gameId: string): Promise<boolean> {
  try {
    const game = await getGameData()
    return game !== null && game.isActive
  } catch {
    return false
  }
}

function calculateTimeLeft(endTime: number): number {
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, endTime - now)
}

export async function getGameState() {
  try {
    const [prizePool, playerCount] = await Promise.all([
      publicClient.readContract({
        address: CONTRACTS.DEGEN_TOKEN.address,
        abi: CONTRACTS.DEGEN_TOKEN.abi,
        functionName: 'balanceOf',
        args: [CONTRACTS.DEGEN_DREAM.address]
      }),
      publicClient.readContract({
        address: CONTRACTS.DEGEN_DREAM.address,
        abi: CONTRACTS.DEGEN_DREAM.abi,
        functionName: 'getPlayerCount'
      })
    ])

    return {
      prizePool: formatEther(prizePool),
      playerCount: Number(playerCount)
    }
  } catch (error) {
    console.error('Error fetching game state:', error)
    return {
      prizePool: '0',
      playerCount: 0
    }
  }
}

export async function getGameCountdown() {
  const game = await getGameData()
  if (!game) throw new Error('Game not found')

  return {
    startTime: game.startTime,
    endTime: game.endTime
  }
} 