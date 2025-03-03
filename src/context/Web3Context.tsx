'use client'

import { createContext, useContext, ReactNode } from 'react'

interface Web3ContextType {
  // Remove wallet connection related props
  // Add any new web3 related props you want to keep
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  // Remove wallet connection logic
  
  const value = {
    // Remove wallet connection related values
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 