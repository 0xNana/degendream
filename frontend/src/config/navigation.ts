export const navigation = {
  main: [
    { name: 'Play', href: '/play' },      
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Feed', href: '/feed' },      
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'NFT', href: '/nft' }         
  ],
  
  // For footer or secondary navigation
  secondary: [
    { name: 'About', href: '/about' },
    { name: 'How to Play', href: '/how-to-play' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' }
  ]
} as const

// Type for navigation items
export type NavigationItem = {
  name: string
  href: string
} 