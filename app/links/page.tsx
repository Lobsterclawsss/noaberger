import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Links — Noa Berger',
  description: 'Curated tools, reads, and resources from Noa Berger.',
  openGraph: {
    title: 'Links — Noa Berger',
    description: 'Curated tools, reads, and resources from Noa Berger.',
  },
};

const categories = [
  {
    name: 'Tools I Use',
    links: [
      { title: 'OpenRouter', url: 'https://openrouter.ai', desc: 'Unified API gateway for 100+ AI models' },
      { title: 'Cloudflare', url: 'https://cloudflare.com', desc: 'CDN, DNS, Pages, and Workers' },
      { title: 'Linear', url: 'https://linear.app', desc: 'Project tracking built for speed' },
    ],
  },
  {
    name: 'Reads',
    links: [
      { title: 'Paul Graham Essays', url: 'https://paulgraham.com/articles.html', desc: 'Timeless writing on startups and thinking clearly' },
      { title: "Lenny's Newsletter", url: 'https://www.lennysnewsletter.com', desc: 'Product, growth, and career advice' },
      { title: 'Stratechery', url: 'https://stratechery.com', desc: 'Ben Thompson on tech strategy and business' },
    ],
  },
  {
    name: 'Companies I Admire',
    links: [
      { title: 'Basecamp', url: 'https://basecamp.com', desc: 'Profitable, calm company building done right' },
      { title: 'Stripe', url: 'https://stripe.com', desc: 'Best developer experience in fintech' },
    ],
  },
];

const Links = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="fade-in text-4xl md:text-5xl font-bold mb-4 text-white">Links</h1>
        <p className="fade-in-1 text-secondary text-xl mb-16" style={{ maxWidth: '65ch' }}>
          Tools, reads, and companies I find worth knowing about.
        </p>

        <div className="space-y-14">
          {categories.map((cat) => (
            <section key={cat.name}>
              <h2 className="text-xs font-semibold text-teal tracking-widest uppercase mb-5">
                {cat.name}
              </h2>
              <div className="space-y-3">
                {cat.links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 bg-surface hover:border-teal/30 transition-colors duration-200 group"
                  >
                    <div>
                      <p className="text-white font-medium">{link.title}</p>
                      <p className="text-secondary text-sm mt-0.5">{link.desc}</p>
                    </div>
                    <span className="text-secondary group-hover:text-teal transition-colors flex-shrink-0 ml-4 text-lg">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Links;
