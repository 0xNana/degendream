'use client'

import { useState, FormEvent } from 'react'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { useDegenDream } from '@/hooks/useDegenDream'
import { Button } from '@/components/ui/button'
import { BetConfirmationModal } from './BetConfirmationModal'
import { useContractRead } from 'wagmi'
import { erc20Abi } from "viem"
import { CONTRACTS } from "@/config/contracts"
import { Loader2 } from 'lucide-react'
import { toast } from "react-hot-toast"

interface BettingInterfaceProps {
  selectedNumbers: number[]
  onBetComplete?: () => void
}

export function BettingInterface({ selectedNumbers, onBetComplete }: BettingInterfaceProps) {
  const { address } = useAccount()
  const [betAmount, setBetAmount] = useState('1')
  const { 
    prepareBet, 
    handleBet, 
    showConfirmation, 
    setShowConfirmation,
    pendingBet,
    isProcessing,
    minBet,
    maxBet 
  } = useDegenDream()
  
  const { data: ddBalance } = useContractRead({
    address: CONTRACTS.DEGEN_TOKEN.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000
    }
  })

  const hasValidSelection = selectedNumbers.length === 6
  const betValue = parseEther(betAmount)
  
  // Convert contract values to bigint for comparison
  const minBetValue = minBet ? BigInt(minBet.toString()) : undefined
  const maxBetValue = maxBet ? BigInt(maxBet.toString()) : undefined
  
  const isValidAmount = minBetValue && maxBetValue 
    ? betValue >= minBetValue && betValue <= maxBetValue
    : true
  
  const hasEnoughBalance = ddBalance 
    ? parseEther(betAmount) <= ddBalance
    : false


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasValidSelection) {
      toast.error('Please select exactly 6 numbers')
      return
    }

    if (!isValidAmount) {
      toast.error('Invalid bet amount')
      return
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient balance')
      return
    }

    const amount = parseEther(betAmount)
    prepareBet(amount, selectedNumbers)
  }

  const onConfirmBet = () => {
    if (pendingBet) {
      handleBet(pendingBet.amount, pendingBet.numbers)
      onBetComplete?.()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-muted-foreground">Bet Amount (DD)</label>
            <div className="text-right">
              {minBetValue && maxBetValue && (
                <span className="text-xs text-muted-foreground block">
                  Min: {formatEther(minBetValue)} | Max: {formatEther(maxBetValue)}
                </span>
              )}
              {ddBalance && (
                <span className="text-xs text-muted-foreground block">
                  Balance: {formatEther(ddBalance)} DD
                </span>
              )}
            </div>
          </div>
          <input
            type="number"
            min={minBetValue ? formatEther(minBetValue) : '1'}
            max={maxBetValue ? formatEther(maxBetValue) : '100'}
            step="1"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className={`
              w-full px-3 py-2 rounded-md
              ${!isValidAmount 
                ? 'border-red-500 bg-red-500/10' 
                : !hasEnoughBalance
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'bg-muted'
              }
            `}
            disabled={isProcessing}
          />
          {!isValidAmount && (
            <p className="text-xs text-red-500">
              Please enter a valid bet amount
            </p>
          )}
          {!hasEnoughBalance && isValidAmount && (
            <p className="text-xs text-yellow-500">
              Insufficient DD token balance
            </p>
          )}
        </div>

        <Button 
          type="submit"
          disabled={!hasValidSelection || isProcessing || !isValidAmount || !hasEnoughBalance}
          className="w-full"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing Bet...
            </span>
          ) : (
            'Place Bet'
          )}
        </Button>

      </form>

      <BetConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={onConfirmBet}
        selectedNumbers={selectedNumbers}
        betAmount={betAmount}
        isProcessing={isProcessing}
      />
    </>
  )
} 