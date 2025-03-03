'use client'

import { useCallback, useState } from 'react'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACTS } from '@/config/contracts'
import { handleTxError } from '@/lib/utils'
import { degenTokenAbi } from '@/config/abis/degenToken'
import { useAccount } from 'wagmi'

// Update cooldown check ABI to match contract
const LAST_REQUEST_ABI = [
  {
    inputs: [{ type: 'address', name: 'user' }],
    name: 'lastFaucetRequest',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export function useFaucet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Update the read contract call
  const { data: lastRequestTime } = useReadContract({
    address: CONTRACTS.DEGEN_TOKEN.address,
    abi: LAST_REQUEST_ABI,
    functionName: 'lastFaucetRequest',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  })

  // Check faucet balance
  const { data: faucetBalance } = useReadContract({
    address: CONTRACTS.DEGEN_TOKEN.address,
    abi: degenTokenAbi,
    functionName: 'balanceOf',
    args: [CONTRACTS.DEGEN_TOKEN.address]
  })

  const requestTokens = useCallback(async () => {
    if (!address) {
      throw new Error('Please connect your wallet first')
    }

    try {
      setIsLoading(true)
      setError(null)

      // Debug logging
      console.log('Debug contract info:', {
        tokenAddress: CONTRACTS.DEGEN_TOKEN.address,
        envTokenAddress: process.env.NEXT_PUBLIC_DEGEN_TOKEN_ADDRESS,
        isAddressValid: CONTRACTS.DEGEN_TOKEN.address?.startsWith('0x'),
        abi: degenTokenAbi,
        hasRequestTokensFunction: degenTokenAbi.find(x => x.name === 'requestTokens')
      })

      await writeContract({
        address: CONTRACTS.DEGEN_TOKEN.address as `0x${string}`,
        abi: degenTokenAbi,
        functionName: 'requestTokens',
      })

    } catch (err) {
      console.error('Faucet error details:', err)
      setError(err instanceof Error ? err.message : 'Failed to request tokens')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  // Changed cooldown check to 12 hours
  const canRequest = lastRequestTime 
    ? (Math.floor(Date.now() / 1000) - Number(lastRequestTime)) >= 12 * 60 * 60 
    : true

  return {
    requestTokens,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    canRequest,
    lastRequestTime,
    faucetBalance
  }
} 