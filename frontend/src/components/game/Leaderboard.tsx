'use client'

import { useLeaderboard } from '@/components/providers/LeaderboardProvider'
import { shortenAddress } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Trophy, Users, Ticket } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Leaderboard() {
  const { leaderboard, userRank, isLoading, stats } = useLeaderboard()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="space-y-4">
        {/* Stats Loading */}
        <div className="grid grid-cols-4 gap-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-2">
              <div className="h-12 bg-secondary rounded-md" />
            </Card>
          ))}
        </div>
        
        {/* Leaderboard Loading */}
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Players</p>
              <h3 className="text-sm font-bold">
                {(stats?.totalPlayers || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Points</p>
              <h3 className="text-sm font-bold">
                {(stats?.totalPoints || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Bets</p>
              <h3 className="text-sm font-bold">
                {(stats?.totalBets || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Win Rate</p>
              <h3 className="text-sm font-bold">
                {(stats?.averageWinRate || 0).toFixed(1)}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* User Rank */}
      {userRank && (
        <div className="p-3 bg-secondary rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium">#{userRank.rank}</span>
              <span>{shortenAddress(userRank.address)}</span>
            </div>
            <div>
              <span>{userRank.points.toLocaleString()} DREAM</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry) => (
          <div 
            key={entry.address}
            className={`p-3 rounded-md ${
              userRank?.address === entry.address ? 'bg-secondary' : 'hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium">#{entry.rank}</span>
                <span>{shortenAddress(entry.address)}</span>
              </div>
              <div>
                <span>{entry.points.toLocaleString()} DREAM</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 