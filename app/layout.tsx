import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Noa Berger',
  description: 'Growth consultant, developer, and entrepreneur. Founder of BLEUKEI.',
  metadataBase: new URL('https://noaberger.com'),
  openGraph: {
    type: 'website',
    url: 'https://noaberger.com',
    title: 'Noa Berger',
    description: 'Growth consultant, developer, and entrepreneur. Founder of BLEUKEI.',
    siteName: 'Noa Berger',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noa Berger',
    description: 'Growth consultant, developer, and entrepreneur. Founder of BLEUKEI.',
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
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
