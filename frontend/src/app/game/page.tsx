'use client'

import { Container } from "@/components/layout/Container"
import { NumberGrid } from "@/components/game/NumberGrid"
import { BettingInterface } from "@/components/game/BettingInterface"
import { Balance } from "@/components/game/Balance"
import { MyBets } from "@/components/game/MyBets"
import { ConnectWallet } from "@/components/ConnectWallet"
import { Faucet } from "@/components/web3/Faucet"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

export default function GamePage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">DegenDream Game</h1>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">DegenDream Game</h1>
            <p className="text-lg text-muted-foreground">
              Select 6 numbers and place your bet to win
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Connect your wallet to play</h2>
              <ConnectWallet />
            </div>
          ) : (
            <>
              <Balance />
              <div className="flex justify-center">
                <Faucet />
              </div>
              
              <div className="space-y-6">
                <NumberGrid 
                  selectedNumbers={selectedNumbers}
                  onSelectionChange={setSelectedNumbers}
                />

                <BettingInterface 
                  selectedNumbers={selectedNumbers}
                  onBetComplete={() => setSelectedNumbers([])}
                />
              </div>
            </>
          )}
        </div>

        <div>
          <MyBets />
        </div>
      </div>
    </Container>
  )
} 