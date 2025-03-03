'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NumberGridProps {
  selectedNumbers: number[]
  onSelectionChange: (numbers: number[]) => void
  maxSelections?: number
  disabled?: boolean
}

export function NumberGrid({ 
  selectedNumbers, 
  onSelectionChange, 
  maxSelections = 6,
  disabled = false 
}: NumberGridProps) {
  
  const handleNumberClick = useCallback((number: number) => {
    if (disabled) return

    const isSelected = selectedNumbers.includes(number)
    let newSelection: number[]

    if (isSelected) {
      // Remove number if already selected
      newSelection = selectedNumbers.filter(n => n !== number)
    } else if (selectedNumbers.length < maxSelections) {
      // Add number if under max selections
      newSelection = [...selectedNumbers, number]
    } else {
      // Don't modify if at max selections
      return
    }

    // Sort numbers for consistent display
    newSelection.sort((a, b) => a - b)
    onSelectionChange(newSelection)
  }, [selectedNumbers, maxSelections, disabled, onSelectionChange])

  return (
    <div className="relative">
      {/* Grid Background with Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 rounded-xl blur-xl" />
      
      <div className="relative grid grid-cols-10 gap-2 p-6 rounded-xl bg-background/80 backdrop-blur-sm">
        {[...Array(99)].map((_, i) => {
          const number = i + 1
          const isSelected = selectedNumbers.includes(number)
          
          return (
            <motion.button
              key={number}
              onClick={() => handleNumberClick(number)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={disabled || (selectedNumbers.length >= maxSelections && !selectedNumbers.includes(number))}
              className={cn(
                "aspect-square rounded-lg text-base font-bold relative overflow-hidden",
                "transition-all duration-200 ease-out transform",
                "hover:shadow-lg hover:shadow-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30"
                  : "bg-muted/50 hover:bg-muted text-foreground",
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Number Background Glow */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-90" />
              )}
              
              {/* Number */}
              <span className="relative z-10 flex items-center justify-center w-full h-full">
                {number}
              </span>

              {/* Selection Animation */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-primary/20 rounded-lg"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selection Counter */}
      <div className="absolute -top-4 right-4 px-3 py-1 bg-background rounded-full shadow-lg border text-sm">
        {selectedNumbers.length}/{maxSelections}
      </div>
    </div>
  )
} 