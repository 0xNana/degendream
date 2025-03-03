'use client'

import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { Card } from '@/components/ui/card'
import { Trophy, Users, Ticket } from 'lucide-react'

const gameStatsAbi = [
  {
    name: 'getTotalPlayers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getTotalPoints',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getTotalBets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export function GameStats() {
  // Get total players
  const { data: totalPlayers } = useContractRead({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: gameStatsAbi,
    functionName: 'getTotalPlayers',
    query: {
      refetchInterval: 5000
    }
  })

  // Get total points
  const { data: totalPoints } = useContractRead({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: gameStatsAbi,
    functionName: 'getTotalPoints',
    query: {
      refetchInterval: 5000
    }
  })

  // Get total bets
  const { data: totalBets } = useContractRead({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: gameStatsAbi,
    functionName: 'getTotalBets',
    query: {
      refetchInterval: 5000
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Players</p>
            <h3 className="text-2xl font-bold">
              {totalPlayers ? Number(totalPlayers).toLocaleString() : '0'}
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total DREAM Points</p>
            <h3 className="text-2xl font-bold">
              {totalPoints ? Number(totalPoints).toLocaleString() : '0'}
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Ticket className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Bets</p>
            <h3 className="text-2xl font-bold">
              {totalBets ? Number(totalBets).toLocaleString() : '0'}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  )
} 