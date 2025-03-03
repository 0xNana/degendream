'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface BetConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedNumbers: number[]
  betAmount: string
  isProcessing?: boolean
}

export function BetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedNumbers,
  betAmount,
  isProcessing
}: BetConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Bet</DialogTitle>
          <DialogDescription>
            Please review your bet details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Numbers</h3>
            <div className="flex flex-wrap gap-2">
              {selectedNumbers.map((number) => (
                <div
                  key={number}
                  className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-md font-bold"
                >
                  {number}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium">Bet Amount</h3>
            <p className="text-2xl font-bold text-primary">
              {betAmount} DD
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium">Potential Winnings</h3>
            <div className="space-y-1 text-sm">
              <p>6 matches: {Number(betAmount) * 100} DD</p>
              <p>5 matches: {Number(betAmount) * 50} DD</p>
              <p>4 matches: {Number(betAmount) * 20} DD</p>
              <p>3 matches: {Number(betAmount) * 10} DD</p>
              <p>2 matches: {Number(betAmount) * 5} DD</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md hover:bg-secondary"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Confirm Bet'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 