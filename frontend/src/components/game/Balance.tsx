'use client'

import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { formatEther } from 'viem'
import { useState, useEffect } from 'react'

export function Balance() {
  const { address } = useAccount()
  const [mounted, setMounted] = useState(false)

  const { data: balance } = useReadContract({
    address: CONTRACTS.DEGEN_TOKEN.address,
    abi: CONTRACTS.DEGEN_TOKEN.abi,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: Boolean(address && mounted)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[24px]" /> // Placeholder with same height
  }

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold">Your Balance</h2>
      <p className="text-2xl font-bold">
        {balance ? formatEther(balance) : '0.00'} DD
      </p>
    </div>
  )
} 