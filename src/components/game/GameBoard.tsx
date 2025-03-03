'use client'

import { NumberGrid } from "./NumberGrid"
import { useEffect, useState, useCallback } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useDegenDream } from "@/hooks/useDegenDream"
import { formatEther, parseEther } from "viem"
import { toast } from "react-hot-toast"

export function GameBoard() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<string>("1") // Default 1 DREAM token

  const {
    handleBet,
    prepareBet,
    isProcessing,
    minBet,
    maxBet,
    isLoadingHistory,
    userStats,
    showConfirmation,
    setShowConfirmation,
    pendingBet
  } = useDegenDream()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
    setIsLoading(false)
  }, [isConnected, router])

  const handlePlaceBet = useCallback(async () => {
    try {
      // Validate number selection
      if (selectedNumbers.length !== 6) {
        toast.error('Please select exactly 6 numbers')
        return
      }

      // Convert bet amount to BigInt (wei)
      const amountInWei = parseEther(betAmount)

      // Validate bet amount against min/max
      if (minBet && amountInWei < minBet) {
        toast.error(`Minimum bet is ${formatEther(minBet)} DD`)
        return
      }
      if (maxBet && amountInWei > maxBet) {
        toast.error(`Maximum bet is ${formatEther(maxBet)} DD`)
        return
      }

      console.log('Preparing bet:', {
        numbers: selectedNumbers,
        amount: amountInWei.toString(),
        amountInDream: betAmount
      })

      // Prepare the bet first (this will show confirmation modal)
      await prepareBet(amountInWei, selectedNumbers)

    } catch (error) {
      console.error('Error preparing bet:', error)
      toast.error('Failed to prepare bet. Please try again.')
    }
  }, [selectedNumbers, betAmount, minBet, maxBet, prepareBet])

  // Add this new handler for confirmation
  const handleConfirmBet = useCallback(async () => {
    if (!pendingBet) {
      console.error('No pending bet found')
      return
    }

    try {
      console.log('Confirming bet:', {
        amount: pendingBet.amount.toString(),
        numbers: pendingBet.numbers,
        minBet: pendingBet.minBet.toString(),
        maxBet: pendingBet.maxBet.toString()
      })

      await handleBet(pendingBet.amount, pendingBet.numbers)
      setSelectedNumbers([])
      setBetAmount("1")
    } catch (error) {
      console.error('Error confirming bet:', error)
      toast.error('Failed to place bet. Please try again.')
    }
  }, [pendingBet, handleBet])

  // Add confirmation modal
  const renderConfirmationModal = () => {
    if (!showConfirmation || !pendingBet) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full space-y-4">
          <h3 className="text-lg font-semibold">Confirm Your Bet</h3>
          <div className="space-y-2">
            <p>Amount: {formatEther(pendingBet.amount)} DD</p>
            <p>Numbers: {pendingBet.numbers.sort((a, b) => a - b).join(', ')}</p>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90"
              onClick={() => setShowConfirmation(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
              onClick={handleConfirmBet}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Bet'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || isLoadingHistory) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Wallet connected: Ready to play
        </div>
        <div className="text-sm font-medium">
          Points: {userStats?.points || 0}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <NumberGrid 
          selectedNumbers={selectedNumbers} 
          onSelectionChange={setSelectedNumbers}
          disabled={isProcessing} 
        />

        <div className="flex items-center gap-4 justify-center">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-24 px-3 py-2 border rounded-md"
            placeholder="Bet amount"
            disabled={isProcessing}
          />
          <span className="text-sm text-muted-foreground">DREAM</span>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            onClick={handlePlaceBet}
            disabled={isProcessing || selectedNumbers.length !== 6}
          >
            {isProcessing ? 'Processing...' : 'Place Bet'}
          </button>
          <button 
            className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50"
            onClick={() => setSelectedNumbers([])}
            disabled={isProcessing}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {selectedNumbers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Selected Numbers: {selectedNumbers.sort((a, b) => a - b).join(', ')}
        </div>
      )}

      {renderConfirmationModal()}
    </div>
  )
} 