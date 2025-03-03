'use client'

import { 
  useAccount, 
  useContractRead, 
  useContractWrite,
  usePublicClient,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import { ContractConfig } from '@/config/contracts'
import { useState, useEffect, useCallback } from 'react'
import { formatEther, parseUnits } from 'viem'
import { handleTxError } from '@/lib/utils'
import { keccak256, toUtf8Bytes } from 'ethers'
import { parseAbiItem } from 'viem'
import { toast } from 'react-hot-toast'
import { erc20Abi } from 'viem'
import { CONTRACTS } from '@/config/contracts'
import { degenDreamAbi } from '@/config/abis/degenDream'
import { publicClient } from '@/config/wagmi'
import { degenTokenAbi } from '@/config/abis/degenToken'

export type GameStatus = 'idle' | 'approving' | 'betting' | 'waiting' | 'complete'

const BET_PLACED_EVENT = 'BetPlaced(uint256,address,uint256,uint256[])'
const BET_PLACED_TOPIC = keccak256(toUtf8Bytes(BET_PLACED_EVENT))

const BetPlacedEvent = parseAbiItem('event BetPlaced(uint256 indexed requestId, address indexed player, uint256 amount, uint8[] numbers)')
const NumbersDrawnEvent = parseAbiItem('event NumbersDrawn(uint256 indexed requestId, uint8[] winningNumbers)')

// Define user stats interface
interface UserStats {
  points: number
  totalBets: number
  wins: number
  totalWinnings: bigint
  bestMatch: number
}

// Define bet interface
interface Bet {
  player: string | `0x${string}`
  timestamp: number
  amount: bigint
  payout: bigint
  won: boolean
  matchedNumbers: number
  selectedNumbers: number[]
  winningNumbers: number[]
  requestId: bigint
  numbers: number[]
  matches: number
  processed: boolean
}

// Define game activity interface
interface GameActivity {
  id: string
  type: 'bet_placed' | 'numbers_drawn'
  timestamp: number
  numbers: number[]
  player?: `0x${string}`
  amount?: bigint
}

// Define transaction response interface
interface TransactionResponse {
  hash: `0x${string}`
  wait: () => Promise<{
    status: 'success' | 'reverted'
    transactionHash: `0x${string}`
    blockNumber: number
    logs: {
      data: string
      topics: string[]
    }[]
  }>
}

// Add the missing ABIs with proper types
const USER_STATS_ABI = [
  {
    inputs: [{ type: 'address', name: 'player' }],
    name: 'getUserStats',
    outputs: [
      { type: 'uint256', name: 'points' },
      { type: 'uint256', name: 'totalBets' },
      { type: 'uint256', name: 'wins' },
      { type: 'uint256', name: 'totalWinnings' },
      { type: 'uint8', name: 'bestMatch' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const MIN_BET_ABI = [
  {
    inputs: [],
    name: 'MIN_BET',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const MAX_BET_ABI = [
  {
    inputs: [],
    name: 'MAX_BET',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const GET_BET_ABI = [
  {
    inputs: [{ type: 'uint256', name: 'requestId' }],
    name: 'getBet',
    outputs: [
      { type: 'address', name: 'player' },
      { type: 'uint256', name: 'amount' },
      { type: 'uint8[]', name: 'numbers' },
      { type: 'bool', name: 'processed' },
      { type: 'uint8', name: 'matches' },
      { type: 'uint256', name: 'payout' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export function useDegenDream() {
  const { address } = useAccount()
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [status, setStatus] = useState<GameStatus>('idle')
  const [pendingRequestId, setPendingRequestId] = useState<bigint>()
  const [isLoading, setIsLoading] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [bettingHistory, setBettingHistory] = useState<Bet[]>([])
  const [winningNumbers, setWinningNumbers] = useState<number[]>([])
  const [totalGames, setTotalGames] = useState<number>(0)
  const [gamesWon, setGamesWon] = useState<number>(0)
  const [totalWinnings, setTotalWinnings] = useState<bigint>(BigInt(0))
  const [bestMatch, setBestMatch] = useState<number>(0)
  const [prizePool, setPrizePool] = useState(BigInt(0))
  const [globalActivity, setGlobalActivity] = useState<GameActivity[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingBet, setPendingBet] = useState<{
    amount: bigint;
    numbers: number[];
    minBet: bigint;
    maxBet: bigint;
  } | null>(null)

  const { writeContract } = useWriteContract()

  const { data: minBet } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: MIN_BET_ABI,
    functionName: 'MIN_BET',
  })

  const { data: maxBet } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: MAX_BET_ABI,
    functionName: 'MAX_BET',
  })

  const { data: currentBet } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: GET_BET_ABI,
    functionName: 'getBet',
    args: pendingRequestId ? [pendingRequestId] : undefined,
  })

  const { data: currentPrizePool } = useReadContract({
    address: CONTRACTS.DEGEN_TOKEN.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [CONTRACTS.DEGEN_DREAM.address],
  })

  const { data: allBets, refetch: refetchBets } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: CONTRACTS.DEGEN_DREAM.abi,
    functionName: 'getAllBets',
  })

  const { data: userStats } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: USER_STATS_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  }) as { data: UserStats | undefined }

  const formattedStats = {
    points: userStats?.points ?? 0,
    totalBets: userStats?.totalBets ?? 0,
    wins: userStats?.wins ?? 0,
    winRate: userStats?.totalBets 
      ? ((userStats.wins / userStats.totalBets) * 100).toFixed(1) 
      : '0',
    totalWinnings: formatEther(userStats?.totalWinnings ?? BigInt(0)),
    bestMatch: userStats?.bestMatch ?? 0
  }

  useEffect(() => {
    if (!publicClient) return

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACTS.DEGEN_DREAM.address,
      abi: CONTRACTS.DEGEN_DREAM.abi,
      eventName: 'BetPlaced',
      onLogs: (logs) => {
        refetchBets()
      }
    })

    return () => {
      unwatch()
    }
  }, [publicClient, refetchBets])

  useEffect(() => {
    const receipt = window.localStorage.getItem('betReceipt')
    if (receipt) {
      const parsedReceipt = JSON.parse(receipt)
      if (parsedReceipt?.logs) {
        const event = parsedReceipt.logs.find(
          (log: { topics: string[] }) => log.topics[0] === BET_PLACED_TOPIC
        )
        if (event?.topics[1]) {
          setPendingRequestId(BigInt(event.topics[1].slice(2)))
          setStatus('waiting')
        }
      }
    }
  }, [])

  // Separate the bet preparation from execution
  const prepareBet = useCallback((amount: bigint, numbers: number[]) => {
    if (!minBet || !maxBet) {
      toast.error('Contract values not loaded')
      return
    }

    setPendingBet({ 
      amount, 
      numbers,
      minBet,
      maxBet
    })
    setShowConfirmation(true)
  }, [minBet, maxBet])

  const fetchBettingHistory = useCallback(async () => {
    if (!address) return
    
    try {
      setIsLoadingHistory(true)
      console.log('Fetching betting history for address:', address)
      const currentBlock = await publicClient.getBlockNumber()
      const CHUNK_SIZE = BigInt(9999)
      const MAX_CHUNKS = 5
      let bets: Bet[] = []

      // First, fetch all NumbersDrawn events
      const numberLogs = await publicClient.getLogs({
        address: CONTRACTS.DEGEN_DREAM.address,
        event: NumbersDrawnEvent,
        fromBlock: currentBlock - (CHUNK_SIZE * BigInt(MAX_CHUNKS)),
        toBlock: currentBlock
      })

      // Create a map of requestId to winning numbers
      const winningNumbersMap = new Map<string, number[]>()
      numberLogs.forEach(log => {
        if (log.args?.requestId && log.args?.winningNumbers) {
          const requestId = log.args.requestId.toString()
          const numbers = Array.from(log.args.winningNumbers)
          winningNumbersMap.set(requestId, numbers)
          console.log(`Mapped winning numbers for request ${requestId}:`, numbers)
        }
      })

      // Fetch user's bets
      for (let i = 0; i < MAX_CHUNKS; i++) {
        const endBlock = currentBlock - (BigInt(i) * CHUNK_SIZE)
        const startBlock = endBlock - CHUNK_SIZE
        
        if (startBlock < BigInt(0)) break

        const betLogs = await publicClient.getLogs({
          address: CONTRACTS.DEGEN_DREAM.address,
          event: BetPlacedEvent,
          args: {
            player: address
          },
          fromBlock: startBlock,
          toBlock: endBlock
        })

        if (betLogs.length === 0) break

        const chunkBets = await Promise.all(
          betLogs.map(async (log) => {
            try {
              const block = await publicClient.getBlock({ blockHash: log.blockHash })
              const requestId = log.args.requestId
              
              if (!requestId) {
                console.error('Request ID is undefined')
                return null
              }

              const requestIdString = requestId.toString()

              // Get bet details from contract
              const result = await publicClient.readContract({
                address: CONTRACTS.DEGEN_DREAM.address,
                abi: GET_BET_ABI,
                functionName: 'getBet',
                args: [requestId] as readonly [bigint]
              }) as [string, bigint, number[], boolean, number, bigint]

              const [player, amount, selectedNumbers, processed, matches, payout] = result

              // Get winning numbers specific to this bet
              const winningNumbers = winningNumbersMap.get(requestIdString) || []

              console.log(`Processing bet ${requestIdString}:`, {
                selectedNumbers,
                winningNumbers,
                processed,
                matches
              })

              // Calculate actual matches only if the bet is processed and has winning numbers
              const actualMatches = processed && winningNumbers.length > 0
                ? selectedNumbers.filter(num => winningNumbers.includes(num)).length
                : matches

              const bet: Bet = {
                player: player as `0x${string}`,
                timestamp: Number(block.timestamp),
                amount,
                payout,
                won: payout > BigInt(0),
                matchedNumbers: actualMatches,
                selectedNumbers: Array.from(selectedNumbers),
                winningNumbers: winningNumbers, // Use specific winning numbers for this bet
                requestId,
                numbers: selectedNumbers,
                matches: actualMatches,
                processed
              }

              return bet
            } catch (error) {
              console.error('Error fetching bet details:', error)
              return null
            }
          })
        )

        bets = [...bets, ...chunkBets.filter((bet): bet is Bet => bet !== null)]
      }
      
      // Sort bets by timestamp (newest first)
      const sortedBets = bets.sort((a, b) => b.timestamp - a.timestamp)
      
      // Log the final processed bets for debugging
      sortedBets.forEach(bet => {
        console.log(`Final bet ${bet.requestId.toString()}:`, {
          selectedNumbers: bet.selectedNumbers,
          winningNumbers: bet.winningNumbers,
          matches: bet.matches,
          processed: bet.processed,
          timestamp: new Date(bet.timestamp * 1000).toISOString()
        })
      })

      setBettingHistory(sortedBets)

    } catch (error) {
      console.error('Error fetching betting history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [address, publicClient])

  const handleBet = useCallback(async (amount: bigint, numbers: number[]) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    console.log('Starting bet process:', {
      userAddress: address,
      contractAddress: CONTRACTS.DEGEN_DREAM.address,
      tokenAddress: CONTRACTS.DEGEN_TOKEN.address,
      amount: amount.toString(),
      numbers
    })

    try {
      setStatus('approving')
      setIsLoading(true)

      // Check token balance first
      const tokenBalance = await publicClient.readContract({
        address: CONTRACTS.DEGEN_TOKEN.address,
        abi: degenTokenAbi,
        functionName: 'balanceOf',
        args: [address]
      })

      if (tokenBalance < amount) {
        toast.error('Insufficient token balance')
        return
      }

      // Check current allowance
      const currentAllowance = await publicClient.readContract({
        address: CONTRACTS.DEGEN_TOKEN.address,
        abi: degenTokenAbi,
        functionName: 'allowance',
        args: [address, CONTRACTS.DEGEN_DREAM.address]
      })

      // Only approve if needed
      if (currentAllowance < amount) {
        try {
          const approvalTx = await writeContract({
            address: CONTRACTS.DEGEN_TOKEN.address,
            abi: degenTokenAbi,
            functionName: 'approve',
            args: [CONTRACTS.DEGEN_DREAM.address, amount]
          })

          if (approvalTx === undefined) {
            toast.error('Approval cancelled')
            return
          }

          // Wait for approval confirmation
          await new Promise(resolve => setTimeout(resolve, 5000))
        } catch (approvalError: any) {
          if (approvalError?.message?.includes('user rejected')) {
            toast.error('Approval rejected by user')
          } else {
            toast.error('Token approval failed')
          }
          return
        }
      }

      // Now place the bet
      setStatus('betting')
      
      try {
        await writeContract({
          address: CONTRACTS.DEGEN_DREAM.address,
          abi: degenDreamAbi,
          functionName: 'placeBet',
          args: [amount, numbers],
        })

        // Wait for bet to be mined
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Check for bet event
        const latestBlock = await publicClient.getBlockNumber()
        
        const logs = await publicClient.getLogs({
          address: CONTRACTS.DEGEN_DREAM.address,
          event: BetPlacedEvent,
          args: {
            player: address
          },
          fromBlock: latestBlock - BigInt(20),
          toBlock: latestBlock
        })

        if (logs.length > 0) {
          const latestBet = logs[logs.length - 1]
          if (latestBet?.args?.requestId) {
            const requestId = latestBet.args.requestId
            setPendingRequestId(requestId)
            setStatus('waiting')
            toast.success('Bet placed successfully!')
            
            // Refresh betting history after a delay
            setTimeout(() => {
              fetchBettingHistory()
            }, 5000)
            
            return
          }
        }
        
        // Even if we don't find the event immediately, consider it a success
        toast.success('Bet placed successfully! Waiting for confirmation...')
        setStatus('waiting')
        
      } catch (betError: any) {
        console.error('Bet error:', betError)
        
        // Only show error for specific cases
        if (betError?.message?.includes('user rejected')) {
          toast.error('Transaction rejected by user')
        } else if (betError?.message?.includes('insufficient funds')) {
          toast.error('Insufficient ETH for gas')
        } else {
          // Don't show generic error messages if the transaction might have gone through
          console.error('Bet error:', betError)
        }
        
        setStatus('idle')
      }
    } catch (error: any) {
      console.error('Betting error:', error)
      // Only show specific error messages
      if (error?.message?.includes('user rejected')) {
        toast.error('Transaction rejected by user')
      } else if (error?.message?.includes('insufficient allowance')) {
        toast.error('Insufficient token allowance')
      } else if (error?.message?.includes('insufficient balance')) {
        toast.error('Insufficient token balance')
      } else if (error?.message?.includes('invalid amount')) {
        toast.error('Invalid bet amount. Must be between MIN_BET and MAX_BET')
      }
      setStatus('idle')
    } finally {
      setIsLoading(false)
      setShowConfirmation(false)
      setPendingBet(null)
    }
  }, [address, writeContract, publicClient, fetchBettingHistory])

  const fetchWinningNumbers = useCallback(async () => {
    if (!publicClient) return

    try {
      const currentBlock = await publicClient.getBlockNumber()
      const CHUNK_SIZE = BigInt(9999)
      const endBlock = currentBlock
      const startBlock = currentBlock - CHUNK_SIZE

      const logs = await publicClient.getLogs({
        address: CONTRACTS.DEGEN_DREAM.address,
        event: NumbersDrawnEvent,
        fromBlock: startBlock,
        toBlock: endBlock
      })

      console.log('Number of winning number events:', logs.length)
      console.log('Winning number logs:', logs)

      if (logs.length > 0) {
        const latestEvent = logs[logs.length - 1]
        if (latestEvent.args?.winningNumbers) {
          const numbers = Array.from(latestEvent.args.winningNumbers)
          setWinningNumbers(numbers)
        }
      }
    } catch (error) {
      console.error('Error fetching winning numbers:', error)
    }
  }, [publicClient])

  useEffect(() => {
    fetchBettingHistory()
    fetchWinningNumbers()
  }, [fetchBettingHistory, fetchWinningNumbers])

  useEffect(() => {
    if (status === 'complete') {
      fetchBettingHistory()
      fetchWinningNumbers()
    }
  }, [status, fetchBettingHistory, fetchWinningNumbers])

  useEffect(() => {
    if (bettingHistory) {
      setTotalGames(bettingHistory.length)
      
      const wonGames = bettingHistory.filter(bet => bet.won).length
      setGamesWon(wonGames)
      
      const winnings = bettingHistory.reduce((total, bet) => {
        return bet.won ? total + bet.amount : total
      }, BigInt(0))
      setTotalWinnings(winnings)
      
      const maxMatches = Math.max(...bettingHistory.map(bet => bet.matchedNumbers || 0))
      setBestMatch(maxMatches)
    }
  }, [bettingHistory])

  useEffect(() => {
    if (currentPrizePool) {
      setPrizePool(currentPrizePool)
    }
  }, [currentPrizePool])

  useEffect(() => {
    const fetchGlobalActivity = async () => {
      if (!publicClient) return

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const CHUNK_SIZE = BigInt(9999)
        const endBlock = currentBlock
        const startBlock = currentBlock - CHUNK_SIZE

        const betLogs = await publicClient.getLogs({
          address: CONTRACTS.DEGEN_DREAM.address,
          event: BetPlacedEvent,
          fromBlock: startBlock,
          toBlock: endBlock
        })

        const numberLogs = await publicClient.getLogs({
          address: CONTRACTS.DEGEN_DREAM.address,
          event: NumbersDrawnEvent,
          fromBlock: startBlock,
          toBlock: endBlock
        })

        const betActivities = await Promise.all(
          betLogs.map(async (log) => {
            const block = await publicClient.getBlock({ blockHash: log.blockHash })
            return {
              id: `bet-${log.transactionHash}-${log.logIndex}`,
              type: 'bet_placed' as const,
              timestamp: Number(block.timestamp),
              numbers: Array.from(log.args?.numbers || []),
              player: log.args?.player as `0x${string}`,
              amount: log.args?.amount
            }
          })
        )

        const numberActivities = await Promise.all(
          numberLogs.map(async (log) => {
            const block = await publicClient.getBlock({ blockHash: log.blockHash })
            return {
              id: `numbers-${log.transactionHash}-${log.logIndex}`,
              type: 'numbers_drawn' as const,
              timestamp: Number(block.timestamp),
              numbers: Array.from(log.args?.winningNumbers || []),
              player: undefined,
              amount: undefined
            }
          })
        )

        const activity: GameActivity[] = [...betActivities, ...numberActivities]
          .sort((a, b) => b.timestamp - a.timestamp)

        setGlobalActivity(activity)
      } catch (error) {
        console.error('Error fetching global activity:', error)
      }
    }

    fetchGlobalActivity()
    const interval = setInterval(fetchGlobalActivity, 10000)

    return () => clearInterval(interval)
  }, [publicClient])

  useEffect(() => {
    if (address) {
      fetchBettingHistory()
    } else {
      setBettingHistory([])
    }
  }, [address, fetchBettingHistory])

  const calculatePoints = (bet: Bet) => {
    const bettingPoints = Number(formatEther(bet.amount)) * 10

    const matchPoints = bet.matchedNumbers * 100

    const winningPoints = bet.won ? Number(formatEther(bet.payout)) * 100 : 0

    const perfectMatchBonus = bet.matchedNumbers === 6 ? 1000 : 0

    return bettingPoints + matchPoints + winningPoints + perfectMatchBonus
  }

  useEffect(() => {
    if (bettingHistory) {
      const points = bettingHistory.reduce((total, bet) => {
        return total + calculatePoints(bet)
      }, 0)

      setTotalPoints(points)
    }
  }, [bettingHistory])

  useEffect(() => {
    if (allBets) {
      setBettingHistory(allBets as Bet[])
    }
  }, [allBets])

  const { 
    data: playerCount, 
    isError: playerCountError,
    isLoading: isPlayerCountLoading,
    refetch: refetchPlayerCount
  } = useReadContract({
    address: CONTRACTS.DEGEN_DREAM.address,
    abi: degenDreamAbi,
    functionName: 'getPlayerCount',
  })

  useEffect(() => {
    console.log('Player count debug:', {
      playerCount,
      error: playerCountError,
      isLoading: isPlayerCountLoading,
      contractAddress: CONTRACTS.DEGEN_DREAM.address,
      envAddress: process.env.NEXT_PUBLIC_DEGEN_DREAM_ADDRESS,
      degenDreamAbi: degenDreamAbi,
      functionExists: degenDreamAbi.find(x => x.name === 'getPlayerCount')
    })
  }, [playerCount, playerCountError, isPlayerCountLoading])

  useEffect(() => {
    if (!publicClient) return

    const unwatch = publicClient.watchEvent({
      address: CONTRACTS.DEGEN_DREAM.address,
      event: {
        type: 'event',
        name: 'NewPlayer',
        inputs: [
          { indexed: true, name: 'player', type: 'address' }
        ]
      },
      onLogs: () => {
        refetchBets?.()
      }
    })

    return () => {
      unwatch()
    }
  }, [publicClient, refetchBets])

  useEffect(() => {
    console.log('Contract Debug:', {
      degenDreamAddress: CONTRACTS.DEGEN_DREAM.address,
      envDreamAddress: process.env.NEXT_PUBLIC_DEGEN_DREAM_ADDRESS,
      degenTokenAddress: CONTRACTS.DEGEN_TOKEN.address,
      envTokenAddress: process.env.NEXT_PUBLIC_DEGEN_TOKEN_ADDRESS,
      contractsMatch: CONTRACTS.DEGEN_DREAM.address === process.env.NEXT_PUBLIC_DEGEN_DREAM_ADDRESS
    })
  }, [])

  return {
    status,
    minBet,
    maxBet,
    handleBet,
    isProcessing: isLoading || txPending || status === 'waiting',
    pendingRequestId,
    isLoading,
    txPending,
    bettingHistory,
    winningNumbers,
    totalGames,
    gamesWon,
    totalWinnings,
    bestMatch,
    prizePool,
    globalActivity,
    totalPoints,
    globalBettingHistory: allBets,
    totalPlayers: playerCount,
    userStats: formattedStats,
    showConfirmation,
    setShowConfirmation,
    pendingBet,
    prepareBet,
    fetchBettingHistory,
    isLoadingHistory,
  }
}

