import type { Metadata } from 'next';
import Link from 'next/link';
import nowData from '@/data/now.json';

export const metadata: Metadata = {
  title: 'About — Noa Berger',
  description: 'Operator and investor based in Hawaii. Founder of BLEUKEI, building businesses at the intersection of AI and local commerce.',
  openGraph: {
    title: 'About — Noa Berger',
    description: 'Operator and investor based in Hawaii. Founder of BLEUKEI, building businesses at the intersection of AI and local commerce.',
  },
};

const About = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Bio section */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20">
          {/* Photo */}
          <div className="fade-in">
            <img
              src="/photos/noa.jpg"
              alt="Noa Berger"
              className="bg-elevated border border-white/10 rounded-xl w-full object-cover"
              style={{ aspectRatio: '3/4' }}
            />
          </div>

          {/* Bio text */}
          <div>
            <h1 className="fade-in text-4xl md:text-5xl font-bold mb-6 text-white">About</h1>
            <div className="fade-in-1 space-y-5 text-secondary leading-relaxed" style={{ maxWidth: '65ch' }}>
              <p>
                I&apos;m an operator and investor based in Hawaii. I build and scale businesses at the
                intersection of AI, operations, and local commerce — helping founders and established
                businesses grow faster through better systems, automation, and digital strategy.
              </p>
              <p>
                I&apos;m the founder of BLEUKEI, a growth consultancy for local businesses, and I run a
                portfolio of ventures powered by OpenClaw, my multi-agent AI platform. I&apos;m focused
                on finding the leverage points between technology and real-world business impact — and
                backing operators who do the same.
              </p>
            </div>
          </div>
        </div>

        {/* Now section */}
        <section className="mb-20">
          <div className="fade-in-2 flex items-baseline gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white">Now</h2>
            <span className="text-secondary text-sm">Updated {nowData.updatedAt}</span>
          </div>
          <ul className="space-y-4">
            {nowData.items.map((item, i) => (
              <li key={i} className="flex gap-4 items-start border-b border-white/10 pb-4 last:border-0">
                <span className="text-teal mt-1 flex-shrink-0">→</span>
                <div>
                  <p className="text-white">{item.text}</p>
                  <p className="text-secondary text-sm mt-1">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Connect section */}
        <section className="fade-in-3">
          <h2 className="text-2xl font-bold text-white mb-6">Connect</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="https://www.linkedin.com/in/noabberger/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-teal text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              LinkedIn
            </Link>
            <a
              href="mailto:NB@noaberger.com"
              className="border border-white/20 hover:border-teal text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              NB@noaberger.com
            </a>
            <Link
              href="https://calendar.app.google/9HkGH8jzjx82fwfk8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal hover:bg-teal-hover text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Schedule a Call
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
