'use client'

import { useAccount } from 'wagmi'
import { useDegenDream } from '@/hooks/useDegenDream'
import { Card } from '@/components/ui/card'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { motion } from 'framer-motion'
import { Trophy, Target, Coins, Award, TrendingUp, Ticket, GamepadIcon } from 'lucide-react'
import { formatEther } from 'viem'
import { formatBetId, formatTimestamp } from '@/lib/utils'
import { PageHeader } from "@/components/ui/page-header"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export function Dashboard() {
  const { isConnected } = useAccount()
  const { 
    userStats,
    prizePool, 
    bettingHistory,
    totalGames,
    gamesWon,
    bestMatch,
    totalPoints
  } = useDegenDream()

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Connect your wallet to view your stats</h2>
        <ConnectButton />
      </div>
    )
  }

  // Calculate win rate
  const winRate = totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(1) : '0'

  // Get recent performance (last 10 games)
  const recentGames = bettingHistory.slice(0, 10)
  const recentWins = recentGames.filter(bet => bet.won).length
  const recentWinRate = recentGames.length > 0 
    ? ((recentWins / recentGames.length) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Player Dashboard"
        description="Track your gaming performance and statistics"
        variant="hero"
      />

      {/* Stats Grid - Now 6 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Points"
          value={totalPoints.toLocaleString()}
          subtitle="Lifetime earnings"
          icon={<Trophy className="h-5 w-5 text-primary" />}
          trend={{
            value: 12.5,
            isPositive: true
          }}
        />
        <StatCard
          title="Prize Pool"
          value={`${formatEther(prizePool)} DD`}
          subtitle="Current pool size"
          icon={<Coins className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Total Bets"
          value={bettingHistory.length}
          subtitle="Bets placed"
          icon={<Ticket className="h-5 w-5 text-primary" />}
          trend={{
            value: 8.3,
            isPositive: true
          }}
        />
        <StatCard
          title="Total Games"
          value={totalGames}
          subtitle="Games played"
          icon={<GamepadIcon className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Games Won"
          value={gamesWon}
          subtitle="Successful games"
          icon={<Award className="h-5 w-5 text-primary" />}
          trend={{
            value: Number(recentWinRate) - Number(winRate),
            isPositive: Number(recentWinRate) >= Number(winRate)
          }}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle="Success rate"
          icon={<Target className="h-5 w-5 text-primary" />}
          trend={{
            value: Number(recentWinRate) - Number(winRate),
            isPositive: Number(recentWinRate) >= Number(winRate)
          }}
        />
      </div>

      {/* Activity Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {bettingHistory.map((bet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${bet.won ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{formatBetId(bet.requestId)}</span>
                  <span className="text-muted-foreground">{formatTimestamp(bet.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={bet.won ? 'text-green-500' : 'text-red-500'}>
                    {bet.won ? `+${formatEther(bet.payout)} DD` : 'Lost'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({bet.matches} matches)
                  </span>
                </div>
              </motion.div>
            ))}

            {bettingHistory.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No bets placed yet
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
} 