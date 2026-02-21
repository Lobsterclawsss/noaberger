import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Work — Noa Berger',
  description: 'Projects and businesses built by Noa Berger: BLEUKEI consultancy, OpenClaw AI platform, and more.',
  openGraph: {
    title: 'Work — Noa Berger',
    description: 'Projects and businesses built by Noa Berger: BLEUKEI consultancy, OpenClaw AI platform, and more.',
  },
};

const projects = [
  {
    title: 'BLEUKEI',
    category: 'Consultancy & Brand',
    description: 'Growth consultancy helping local businesses scale through better operations and digital presence.',
    stats: ['50+ clients', '3x avg growth', '6-figure revenue'],
    link: 'https://bleukei.com',
    external: true,
  },
  {
    title: 'OpenClaw',
    category: 'AI & Automation',
    description: 'Multi-agent AI platform running 24/7 operations across three companies: BLEUKEI, AGENCY, and AZUL.',
    stats: ['8 agents', '24/7 operation', '70% time saved'],
    link: '#',
    external: false,
  },
  {
    title: 'Cost Router Framework',
    category: 'Developer Tool',
    description: 'Intelligent model selection system optimizing AI API costs by routing requests to the right model.',
    stats: ['30-70% savings', 'OpenRouter integration', 'TypeScript'],
    link: '#',
    external: false,
  },
];

const Work = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="fade-in text-4xl md:text-5xl font-bold mb-4 text-white">Work</h1>
        <p className="fade-in-1 text-xl text-secondary mb-16" style={{ maxWidth: '65ch' }}>
          Projects and businesses I&apos;ve built.
        </p>

        <div className="space-y-8">
          {projects.map((project, idx) => (
            <div
              key={project.title}
              className="border border-white/10 rounded-2xl p-8 bg-surface hover:border-teal/30 transition-colors duration-200"
              style={{ animationDelay: `${(idx + 2) * 0.1}s` }}
            >
              <p className="text-teal text-sm font-medium mb-2 tracking-wide">{project.category}</p>
              <h2 className="text-2xl font-bold mb-3 text-white">{project.title}</h2>
              <p className="text-secondary mb-6 leading-relaxed" style={{ maxWidth: '65ch' }}>{project.description}</p>

              <div className="flex flex-wrap gap-3">
                {project.stats.map((stat) => (
                  <span key={stat} className="bg-elevated border border-white/10 text-secondary px-3 py-1 rounded-full text-sm">
                    {stat}
                  </span>
                ))}
              </div>

              {project.external && (
                <div className="mt-6">
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal hover:text-mint text-sm font-medium transition-colors duration-200"
                  >
                    Visit site →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;