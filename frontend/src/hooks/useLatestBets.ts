import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { formatEther } from 'viem'

export interface Bet {
  requestId: bigint
  player: string
  amount: string
  numbers: number[]
  timestamp: number
  processed: boolean
  won: boolean
  matches: number
  payout: string
}

export function useLatestBets(limit = 10) {
  const { data: latestBets } = useContractRead({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: CONTRACTS.DEGEN_DREAM.abi,
    functionName: 'getAllBets',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
      enabled: true
    }
  })

  // Format bet data and handle type safety
  const formattedBets: Bet[] = Array.isArray(latestBets) 
    ? latestBets.slice(0, limit).map((bet) => ({
        requestId: BigInt(bet.requestId || 0),
        player: bet.player,
        amount: formatEther(BigInt(bet.amount || 0)),
        numbers: Array.isArray(bet.numbers) ? bet.numbers : [],
        timestamp: Number(bet.timestamp || 0),
        processed: Boolean(bet.processed),
        won: Boolean(bet.won),
        matches: Number(bet.matches || 0),
        payout: formatEther(BigInt(bet.payout || 0))
      }))
    : []

  return {
    bets: formattedBets
  }
} 