'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDegenDream } from '@/hooks/useDegenDream'
import { formatEther } from 'viem'

interface LeaderboardEntry {
  address: string
  points: number
  rank: number
  totalBets: number
  totalWinnings: bigint
  formattedPoints: string
  formattedWinnings: string
  winRate: number
}

interface LeaderboardStats {
  totalPlayers: number
  totalPoints: number
  totalBets: number
  averageWinRate: number
  topPrize: number
}

interface LeaderboardContextType {
  leaderboard: LeaderboardEntry[]
  userRank: LeaderboardEntry | null
  stats: LeaderboardStats
  isLoading: boolean
  timeframe: 'all' | 'month' | 'week'
  setTimeframe: (timeframe: 'all' | 'month' | 'week') => void
}

const LeaderboardContext = createContext<LeaderboardContextType>({
  leaderboard: [],
  userRank: null,
  stats: {
    totalPlayers: 0,
    totalPoints: 0,
    totalBets: 0,
    averageWinRate: 0,
    topPrize: 0
  },
  isLoading: false,
  timeframe: 'all',
  setTimeframe: () => {}
})

// Add export to the interface
export interface BetHistoryEntry {
  player: string
  timestamp: number
  amount: bigint
  payout: bigint
  won: boolean
  matchedNumbers: number
  selectedNumbers: number[]
  winningNumbers: number[]
  requestId: bigint
  numbers: number[]
  matches: number
  processed: boolean
}

export function LeaderboardProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount()
  const { globalBettingHistory } = useDegenDream()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [stats, setStats] = useState<LeaderboardStats>({
    totalPlayers: 0,
    totalPoints: 0,
    totalBets: 0,
    averageWinRate: 0,
    topPrize: 0
  })
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Points calculation function
  const calculatePoints = (bet: {
    amount: bigint
    matchedNumbers: number
    won: boolean
    payout: bigint
  }) => {
    // Base points for betting (10 points per 1 DD)
    const bettingPoints = Number(formatEther(bet.amount)) * 10

    // Points for matches
    const matchPoints = bet.matchedNumbers * 100  // 100 points per number matched

    // Bonus points for winning
    const winningPoints = bet.won ? Number(formatEther(bet.payout)) * 100 : 0

    // Perfect match bonus (6/6)
    const perfectMatchBonus = bet.matchedNumbers === 6 ? 1000 : 0

    return bettingPoints + matchPoints + winningPoints + perfectMatchBonus
  }

  useEffect(() => {
    if (!globalBettingHistory || !Array.isArray(globalBettingHistory)) return

    setIsLoading(true)

    try {
      // Aggregate all players' stats
      const playerStats = new Map<string, {
        points: number
        totalBets: number
        wins: number
        totalWinnings: bigint
      }>()

      // Filter history based on timeframe
      const now = Date.now()
      const filteredHistory = globalBettingHistory.filter((bet: BetHistoryEntry) => {
        if (timeframe === 'all') return true
        
        const betTime = bet.timestamp * 1000
        const oneWeek = 7 * 24 * 60 * 60 * 1000
        const oneMonth = 30 * 24 * 60 * 60 * 1000
        
        if (timeframe === 'week') {
          return now - betTime <= oneWeek
        }
        if (timeframe === 'month') {
          return now - betTime <= oneMonth
        }
        return true
      })

      filteredHistory.forEach((bet: BetHistoryEntry) => {
        const stats = playerStats.get(bet.player) || {
          points: 0,
          totalBets: 0,
          wins: 0,
          totalWinnings: BigInt(0)
        }

        // Update stats
        stats.totalBets++
        if (bet.won) {
          stats.wins++
          stats.totalWinnings += bet.payout
        }

        // Calculate points for this bet
        const points = calculatePoints(bet)
        stats.points += points || 0

        playerStats.set(bet.player, stats)
      })

      // Convert to leaderboard entries
      const leaderboardData = Array.from(playerStats.entries())
        .map(([address, stats]) => ({
          address,
          points: stats.points,
          totalWinnings: stats.totalWinnings,
          totalBets: stats.totalBets,
          rank: 0,
          formattedPoints: stats.points.toFixed(2),
          formattedWinnings: formatEther(stats.totalWinnings),
          winRate: stats.totalBets > 0 ? (stats.wins / stats.totalBets) * 100 : 0
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      // Calculate global stats
      const stats = {
        totalPlayers: leaderboardData.length,
        totalPoints: leaderboardData.reduce((sum, entry) => sum + entry.points, 0),
        totalBets: leaderboardData.reduce((sum, entry) => sum + entry.totalBets, 0),
        averageWinRate: leaderboardData.length > 0 
          ? leaderboardData.reduce((sum, entry) => sum + entry.winRate, 0) / leaderboardData.length 
          : 0,
        topPrize: leaderboardData.length > 0 
          ? Math.max(...leaderboardData.map(entry => entry.points))
          : 0
      }

      setStats(stats)
      setLeaderboard(leaderboardData)
      setUserRank(leaderboardData.find(entry => entry.address === address) || null)
    } catch (error) {
      console.error('Error processing leaderboard data:', error)
      setLeaderboard([])
      setUserRank(null)
      setStats({
        totalPlayers: 0,
        totalPoints: 0,
        totalBets: 0,
        averageWinRate: 0,
        topPrize: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [globalBettingHistory, timeframe, address])

  return (
    <LeaderboardContext.Provider value={{
      leaderboard,
      userRank,
      stats,
      isLoading,
      timeframe,
      setTimeframe
    }}>
      {children}
    </LeaderboardContext.Provider>
  )
}

export const useLeaderboard = () => useContext(LeaderboardContext) 