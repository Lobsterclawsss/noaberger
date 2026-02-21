import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Noa Berger — Operator & Investor',
  description: 'Operator and investor helping businesses grow through AI, automation, and smart systems. Founder of BLEUKEI.',
  metadataBase: new URL('https://noaberger.com'),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://noaberger.com',
    title: 'Noa Berger — Operator & Investor',
    description: 'Operator and investor helping businesses grow through AI, automation, and smart systems. Founder of BLEUKEI.',
    siteName: 'Noa Berger',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Noa Berger — Operator & Investor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noa Berger — Operator & Investor',
    description: 'Operator and investor helping businesses grow through AI, automation, and smart systems. Founder of BLEUKEI.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Header />
        {children}
        <Footer />
        {/* Cloudflare Web Analytics — replace YOUR_TOKEN after connecting in Cloudflare dashboard */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "YOUR_TOKEN"}'
        />
      </body>
    </html>
  )
}
