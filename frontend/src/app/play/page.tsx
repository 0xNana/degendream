'use client'

import { Container } from "@/components/layout/Container"
import { Balance } from "@/components/game/Balance"
import { GameClient } from "@/components/game/GameClient"
import { MyBets } from "@/components/game/MyBets"
import { ConnectButton } from "@/components/web3/ConnectButton"
import { Faucet } from "@/components/web3/Faucet"
import { useAccount } from "wagmi"
import { Suspense, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDegenDream } from "@/hooks/useDegenDream"
import { formatEther } from "viem"
import { cn } from "@/lib/utils"

function SelectedNumbersDisplay({ numbers }: { numbers: number[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Selected Numbers</h3>
      <div className="flex items-center justify-center gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold",
              numbers[i] 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "border-2 border-dashed border-muted-foreground/30"
            )}
          >
            {numbers[i] || ""}
          </div>
        ))}
      </div>
    </Card>
  )
}

function BalanceAndPrizePool() {
  const { prizePool } = useDegenDream()

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Your Balance</h3>
            <div className="text-lg font-bold mt-1">
              <Balance />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Prize Pool</h3>
            <div className="text-lg font-bold mt-1">
              {formatEther(prizePool)} DD
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function PlayPage() {
  const { isConnected } = useAccount()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  return (
    <Container className="py-6">
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              DegenDream Game
            </h1>
            <p className="text-lg text-muted-foreground">
              Select 6 numbers and place your bet to win
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Connect your wallet to play</h2>
              <div className="flex justify-center gap-4">
                <ConnectButton />
                <Faucet />
              </div>
            </div>
          ) : (
            <>
              <BalanceAndPrizePool />
              
              <SelectedNumbersDisplay numbers={selectedNumbers} />
              
              <Suspense fallback={<div>Loading game...</div>}>
                <GameClient onNumbersChange={setSelectedNumbers} />
              </Suspense>
            </>
          )}
        </div>

        <div className="lg:border-l lg:border-border lg:pl-8">
          <Suspense fallback={<div>Loading history...</div>}>
            <MyBets />
          </Suspense>
        </div>
      </div>
    </Container>
  )
} 