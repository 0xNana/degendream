'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
    }
  }, [error])

  if (!mounted) {
    return <Button>Connect Wallet</Button>
  }

  const isLoading = status === 'pending'

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button 
          variant="outline" 
          onClick={() => disconnect()}
          disabled={isLoading}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => {
                  connect({ connector })
                  setShowDialog(false)
                }}
                disabled={!connector.ready || isLoading}
                variant={connector.ready ? 'default' : 'outline'}
              >
                {connector.name}
                {!connector.ready && ' (unsupported)'}
                {isLoading && 
                  connector.id === connectors.find(c => c.ready)?.id && 
                  ' (connecting)'}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 