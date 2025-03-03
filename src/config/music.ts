export type Track = {
  id: string
  title: string
  artist: string
  url: string
  category: 'ambient' | 'upbeat' | 'epic'
  volume: number
}

export type Playlist = {
  id: string
  name: string
  description: string
  tracks: Track[]
}

export const PLAYLISTS: Playlist[] = [
  {
    id: 'ambient',
    name: 'Ambient Vibes',
    description: 'Calm and focused background music',
    tracks: [
      {
        id: 'ambient-1',
        title: 'Deep Focus',
        artist: 'DegenDream',
        url: '/music/ambient/deep-focus.mp3',
        category: 'ambient',
        volume: 0.3
      },
      {
        id: 'ambient-2',
        title: 'Cosmic Dreams',
        artist: 'DegenDream',
        url: '/music/ambient/cosmic-dreams.mp3',
        category: 'ambient',
        volume: 0.3
      }
    ]
  },
  {
    id: 'upbeat',
    name: 'Trading Mode',
    description: 'Energetic music for trading sessions',
    tracks: [
      {
        id: 'upbeat-1',
        title: 'Market Momentum',
        artist: 'DegenDream',
        url: '/music/upbeat/market-momentum.mp3',
        category: 'upbeat',
        volume: 0.3
      },
      {
        id: 'upbeat-2',
        title: 'Bull Run',
        artist: 'DegenDream',
        url: '/music/upbeat/bull-run.mp3',
        category: 'upbeat',
        volume: 0.3
      }
    ]
  }
] 