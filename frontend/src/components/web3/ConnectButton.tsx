'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

// Define proper error types
interface WalletError {
  code: number
  message: string
  name: string
}

const ERROR_MESSAGES = {
  USER_REJECTED: 'Connection rejected by user',
  CHAIN_NOT_SUPPORTED: 'Chain not supported',
  ALREADY_PROCESSING: 'Connection already in progress',
  DEFAULT: 'Failed to connect wallet'
} as const

type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await open()
    } catch (error: unknown) {
      const walletError = error as WalletError
      handleError(walletError)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast.success('Wallet disconnected', {
        duration: 2000
      })
    } catch (error) {
      handleError(error as WalletError)
    }
  }

  const handleError = (error: WalletError) => {
    console.error('Connection error:', error)

    let errorMessage: ErrorMessageType = ERROR_MESSAGES.DEFAULT
    
    if (error.code === 4001 || error.message.includes('rejected')) {
      errorMessage = ERROR_MESSAGES.USER_REJECTED
    } else if (error.message.includes('network')) {
      errorMessage = ERROR_MESSAGES.CHAIN_NOT_SUPPORTED
    } else if (error.message.includes('wallet')) {
      errorMessage = ERROR_MESSAGES.ALREADY_PROCESSING
    }

    toast.error(errorMessage, {
      duration: 4000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button
            onClick={handleDisconnect}
            variant="secondary"
            size="sm"
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          variant="default"
          size="sm"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </>
  )
} 