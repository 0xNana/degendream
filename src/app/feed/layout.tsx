import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Live Activity Feed | DegenDream',
  description: 'Watch live bets and winning numbers from all players in real-time.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 