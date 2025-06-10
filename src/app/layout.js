import './globals.css'
import MobileLayout from '@/components/navigation/MobileLayout'
import { SubscriptionProvider } from '@/hooks/useSubscription'
import { AuthProvider } from '@/contexts/AuthContext'
import { StripeProvider } from '@/contexts/StripeContext'
import { CapacitorProvider } from '@/components/mobile/CapacitorProvider'

export const metadata = {
  title: 'SoulLens.AI - Personal Growth Companion',
  description: 'Your personal AI companion for self-discovery, growth, and meaningful conversations',
  keywords: 'AI companion, personal growth, self-discovery, mental health, therapy, coaching, journaling',
  authors: [{ name: 'SoulLens AI' }],
  creator: 'SoulLens AI',
  publisher: 'SoulLens AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://soullens.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SoulLens.AI - Personal Growth Companion',
    description: 'Your personal AI companion for self-discovery, growth, and meaningful conversations',
    url: '/',
    siteName: 'SoulLens AI',
    images: [
      {
        url: '/images/primary_logo_w_tagline.jpg',
        width: 1200,
        height: 630,
        alt: 'SoulLens AI - Personal Growth Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoulLens.AI - Personal Growth Companion',
    description: 'Your personal AI companion for self-discovery, growth, and meaningful conversations',
    images: ['/images/primary_logo_w_tagline.jpg'],
    creator: '@soullensai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/images/app_icon.jpg',
    shortcut: '/images/app_icon.jpg',
    apple: '/images/app_icon.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SoulLens AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#4f46e5',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA and Mobile Optimization */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/app_icon.jpg" />
        <link rel="apple-touch-icon" href="/images/app_icon.jpg" />
        
        {/* Mobile Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SoulLens AI" />
        
        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4f46e5" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Disable automatic detection */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/app_icon.jpg" as="image" />
      </head>
      <body className="h-screen overflow-hidden">
        <AuthProvider>
          <StripeProvider>
            <SubscriptionProvider>
              <CapacitorProvider>
                <MobileLayout>
                  {children}
                </MobileLayout>
              </CapacitorProvider>
            </SubscriptionProvider>
          </StripeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}