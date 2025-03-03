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
  themeColor: '#000000',
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
    'theme-color': '#000000',
    'msapplication-navbutton-color': '#000000',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-starturl': '/',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <head>
        {/* PWA specific tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DegenDream" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DegenDream" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        <meta name="msapplication-starturl" content="/" />
        
        {/* Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180.png" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* SEO */}
        <title>DegenDream</title>
        <meta name="description" content="Decentralized Lottery Game on Ethereum" />
      </head>
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
