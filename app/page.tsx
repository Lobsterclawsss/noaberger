import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero — mesh gradient */}
      <section
        className="py-28 px-6 relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 15% 65%, rgba(6,131,161,0.12) 0%, transparent 55%), radial-gradient(ellipse at 88% 12%, rgba(4,24,64,0.55) 0%, transparent 50%), #000000',
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <p className="fade-in text-teal font-medium mb-4 text-sm tracking-widest uppercase">Noa Berger</p>
          <h1 className="fade-in-1 text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Operator &amp;<br />Investor
          </h1>
          <p className="fade-in-2 text-xl text-secondary max-w-2xl leading-relaxed mb-10">
            I build and scale businesses at the intersection of AI, automation, and local commerce.
            Founder of{' '}
            <Link href="https://bleukei.com" target="_blank" rel="noopener noreferrer" className="text-teal hover:text-mint transition-colors">
              BLEUKEI
            </Link>
            .
          </p>
          <div className="fade-in-3 flex flex-wrap gap-4">
            <Link
              href="https://calendar.app.google/9HkGH8jzjx82fwfk8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal hover:bg-teal-hover text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Schedule a Call
            </Link>
            <Link
              href="https://bleukei.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-teal text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              View BLEUKEI →
            </Link>
          </div>
        </div>
      </section>

      {/* Currently Building */}
      <section className="py-16 px-6 bg-surface">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-white">Currently Building</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'BLEUKEI',
                desc: 'Growth consultancy for local businesses. Operations, digital strategy, and AI-powered systems.',
                link: 'https://bleukei.com',
              },
              {
                name: 'OpenClaw',
                desc: 'Multi-agent AI platform running 24/7 operations across three companies.',
                link: '#',
              },
              {
                name: 'AZUL',
                desc: 'Personal systems and life optimization. The infrastructure behind the work.',
                link: '#',
              },
            ].map((project) => (
              <div
                key={project.name}
                className="border border-white/10 rounded-xl p-6 bg-elevated hover:border-teal/40 transition-colors duration-200"
              >
                <h3 className="font-bold text-lg mb-2 text-white">{project.name}</h3>
                <p className="text-secondary text-sm leading-relaxed">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;