'use client'

import { Container } from "@/components/layout/Container"
import { Card } from "@/components/ui/card"
import { BetsHistory } from "@/components/game/BetsHistory"
import { WinningNumbers } from "@/components/game/WinningNumbers"
import { PageHeader } from "@/components/ui/page-header"

export default function FeedPage() {
  return (
    <Container>
      <div className="py-12 space-y-8">
        <PageHeader
          title="Live Activity Feed"
          description="Watch live bets and winning numbers from all players"
          variant="hero"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <BetsHistory />
          </Card>
          
          <Card>
            <WinningNumbers />
          </Card>
        </div>
      </div>
    </Container>
  )
} 