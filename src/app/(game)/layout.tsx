'use client'

import { Container } from "@/components/layout/Container"

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container>
      {children}
    </Container>
  )
} 