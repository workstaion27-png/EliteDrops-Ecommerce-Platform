import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LuxuryHub - Curated Luxury Lifestyle Products',
  description: 'Discover premium luxury lifestyle products with uncompromising quality and exceptional service. Free worldwide shipping on orders over $100.',
  keywords: ['luxury products', 'premium lifestyle', 'dropshipping', 'quality products', 'global shipping', 'customer service'],
  authors: [{ name: 'LuxuryHub Team' }],
  creator: 'LuxuryHub',
  publisher: 'LuxuryHub',
  openGraph: {
    title: 'LuxuryHub - Curated Luxury Lifestyle Products',
    description: 'Discover premium luxury lifestyle products with uncompromising quality and exceptional service. Free worldwide shipping.',
    url: 'https://luxuryhub.com',
    siteName: 'LuxuryHub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxuryHub - Curated Luxury Lifestyle Products',
    description: 'Discover premium luxury lifestyle products with uncompromising quality and exceptional service.',
    creator: '@luxuryhub',
  },
  viewport: 'width=device-width, initial-scale=1',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
