// Heading schema for consistency
export type HeadingVariant = 
  | 'hero'      // Large, gradient, centered (Dashboard, Landing)
  | 'section'   // Medium, bold (Card titles)
  | 'subtitle'  // Small, muted (Descriptions)

export interface PageHeaderProps {
  title: string
  description?: string
  variant?: HeadingVariant
  align?: 'left' | 'center'
} 