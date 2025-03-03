import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Providers } from './providers'
import { registerServiceWorker } from './pwa'
import { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

// Define metadata for the app including PWA configurations
export const metadata: Metadata = {
  title: 'DegenDream',
  description: 'Decentralized Lottery Game on Ethereum',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DegenDream'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: [
      { url: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/icons/favicon.ico'],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/apple-icon-180.png',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'DegenDream',
    'apple-mobile-web-app-title': 'DegenDream',
    'msapplication-navbutton-color': '#000000',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-starturl': '/',
    'theme-color': '#000000'
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Register service worker only on client side
  if (typeof window !== 'undefined') {
    registerServiceWorker()
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
