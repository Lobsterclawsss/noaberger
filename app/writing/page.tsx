import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Writing — Noa Berger',
  description: 'Thoughts on AI systems, operations, and building businesses.',
  openGraph: {
    title: 'Writing — Noa Berger',
    description: 'Thoughts on AI systems, operations, and building businesses.',
  },
};

const Writing = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="fade-in text-4xl md:text-5xl font-bold mb-4 text-white">Writing</h1>
        <p className="fade-in-1 text-secondary text-xl mb-16" style={{ maxWidth: '65ch' }}>
          Thoughts on AI, operations, and building businesses.
        </p>

        <div className="fade-in-2 border border-white/10 rounded-2xl p-12 text-center bg-surface">
          <p className="text-4xl mb-6">✍️</p>
          <h2 className="text-2xl font-bold mb-3 text-white">Coming Soon</h2>
          <p className="text-secondary max-w-md mx-auto leading-relaxed">
            Working on writing about AI systems, operations, and what I&apos;ve learned building businesses.
            Check back soon — or subscribe to the{' '}
            <Link
              href="/feed.xml"
              className="text-teal hover:text-mint transition-colors"
            >
              RSS feed
            </Link>{' '}
            to be notified.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Writing;
