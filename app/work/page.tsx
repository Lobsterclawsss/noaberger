"use client";

import { motion } from 'framer-motion';

const projects = [
  {
    title: 'BLEUKEI',
    category: 'Consultancy & Brand',
    description: 'Growth consultancy helping local businesses scale through better operations and digital presence.',
    stats: ['50+ clients', '3x avg growth', '6-figure revenue'],
    link: 'https://bleukei.com'
  },
  {
    title: 'AI Operations System',
    category: 'Automation',
    description: 'Multi-agent AI system managing three companies: BLEUKEI, AGENCY, and AZUL.',
    stats: ['10+ agents', '24/7 operation', '70% time saved'],
    link: '#'
  },
  {
    title: 'Cost Router Framework',
    category: 'Developer Tool',
    description: 'Intelligent model selection system optimizing AI API costs by 30-70%.',
    stats: ['30-70% savings', 'OpenRouter integration', 'TypeScript'],
    link: '#'
  }
];

const Work = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Work</h1>
          <p className="text-xl text-slate-600 mb-12">
            Projects and businesses I've built.
          </p>
        </motion.div>

        <div className="space-y-12">
          {projects.map((project, idx) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <p className="text-primary-600 text-sm font-medium mb-2">{project.category}</p>
              <h2 className="text-2xl font-bold mb-3">{project.title}</h2>
              <p className="text-slate-600 mb-6">{project.description}</p>
              
              <div className="flex flex-wrap gap-3">
                {project.stats.map((stat) => (
                  <span key={stat} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                    {stat}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
