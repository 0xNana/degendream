import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GameResult = {
  requestId: bigint
  timestamp: number
  numbers: number[]
  winningNumbers: number[]
  matches: number
  payout: bigint
  status: 'pending' | 'won' | 'lost'
}

interface GameState {
  results: GameResult[]
  addResult: (result: GameResult) => void
  updateResult: (requestId: bigint, update: Partial<GameResult>) => void
  clearHistory: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      results: [],
      addResult: (result) => 
        set((state) => ({
          results: [result, ...state.results].slice(0, 50) // Keep last 50 games
        })),
      updateResult: (requestId, update) =>
        set((state) => ({
          results: state.results.map(result =>
            result.requestId === requestId
              ? { ...result, ...update }
              : result
          )
        })),
      clearHistory: () => set({ results: [] })
    }),
    {
      name: 'game-history'
    }
  )
) 