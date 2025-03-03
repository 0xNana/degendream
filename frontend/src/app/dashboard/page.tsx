'use client'

import { Container } from "@/components/layout/Container"
import { Dashboard } from "@/components/game/Dashboard"

export default function DashboardPage() {
  return (
    <Container>
      <div className="py-12">
        <Dashboard />
      </div>
    </Container>
  )
} 