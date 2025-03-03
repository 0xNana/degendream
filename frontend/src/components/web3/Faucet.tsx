'use client'

import { Button } from '@/components/ui/button'
import { useFaucet } from '@/hooks/useFaucet'
import { useAccount } from 'wagmi'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Loader2, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Faucet() {
  const { 
    requestTokens, 
    isLoading, 
    canRequest, 
    lastRequestTime,
    error 
  } = useFaucet()
  const { isConnected } = useAccount()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const { toast } = useToast()

  // Calculate time left in cooldown
  useEffect(() => {
    if (!lastRequestTime || canRequest) {
      setTimeLeft('')
      return
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const cooldownPeriod = 12 * 60 * 60 // Changed to 12 hours
      const timeSinceLastRequest = now - Number(lastRequestTime)
      const remainingTime = cooldownPeriod - timeSinceLastRequest

      if (remainingTime <= 0) {
        setTimeLeft('')
        return
      }

      const hours = Math.floor(remainingTime / 3600)
      const minutes = Math.floor((remainingTime % 3600) / 60)
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [lastRequestTime, canRequest])

  const handleRequestTokens = async () => {
    try {
      await requestTokens()
      toast({
        title: 'Success!',
        description: 'Tokens have been sent to your wallet.',
        variant: 'default',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to request tokens',
        variant: 'destructive',
      })
    }
  }

  if (!isConnected) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleRequestTokens}
            disabled={isLoading || !canRequest}
            variant="outline"
            size="sm"
            className={cn(
              "transition-colors duration-200",
              canRequest && "bg-green-500 hover:bg-green-600 text-white border-0",
              !canRequest && !isLoading && "bg-yellow-500 hover:bg-yellow-600 text-white border-0"
            )}
          >
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Requesting...
                </div>
              ) : !canRequest ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {timeLeft || 'Cooldown'}
                </div>
              ) : (
                "Get 1,000 DD"
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {!canRequest && timeLeft ? (
              <p className="text-sm">Available in {timeLeft}</p>
            ) : (
              <p className="text-sm">Get 1,000 DD test tokens</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 