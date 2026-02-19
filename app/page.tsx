"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary-600 font-medium mb-4">Hello, I'm</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Noa Berger
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed mb-8">
              I help local businesses grow through better operations, 
              automation, and digital strategy. Founder of{' '}
              <Link href="https://bleukei.com" className="text-primary-600 hover:underline">
                BLEUKEI
              </Link>.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/work"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                See My Work
              </Link>
              <Link 
                href="/contact"
                className="border border-slate-300 hover:border-primary-600 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Current Focus */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Currently Building</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'BLEUKEI',
                desc: 'Growth consultancy for local businesses',
                link: 'https://bleukei.com'
              },
              {
                name: 'AGENCY',
                desc: 'Development & automation projects',
                link: '#'
              },
              {
                name: 'AZUL',
                desc: 'Personal systems & life optimization',
                link: '#'
              }
            ].map((project) => (
              <div key={project.name} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                <p className="text-slate-600 text-sm">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50+', label: 'Businesses Helped' },
              { number: '3x', label: 'Avg. Growth' },
              { number: '5+', label: 'Years Experience' },
              { number: '100%', label: 'Satisfaction' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.number}</div>
                <div className="text-slate-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
