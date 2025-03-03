'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { getChainInfo } from '@/lib/chains'

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({
    address,
  })

  const chainInfo = chainId ? getChainInfo(chainId) : null

  if (!isConnected) {
    return (
      <div className="text-center text-muted-foreground">
        Connect your wallet to see your balance
      </div>
    )
  }

  return (
    <div className="p-6 border border-border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
      <div className="space-y-2">
        <p>
          <span className="text-muted-foreground">Address:</span>{' '}
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <p>
          <span className="text-muted-foreground">Network:</span>{' '}
          {chainInfo?.name || 'Unknown'}
        </p>
        {balance && (
          <p>
            <span className="text-muted-foreground">Balance:</span>{' '}
            {balance.formatted} {balance.symbol}
          </p>
        )}
      </div>
    </div>
  )
} 