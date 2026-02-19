"use client";

import { motion } from 'framer-motion';

const posts = [
  {
    title: 'Building an AI-Powered Operations System',
    date: 'February 2026',
    excerpt: 'How I built a multi-agent system to manage three companies simultaneously.',
    slug: 'ai-operations-system'
  },
  {
    title: 'The Real Cost of AI APIs',
    date: 'January 2026',
    excerpt: 'Why model selection matters and how to optimize your AI spending.',
    slug: 'ai-api-costs'
  },
  {
    title: 'Helping Local Businesses Grow',
    date: 'December 2025',
    excerpt: 'Lessons from working with 50+ local businesses on their digital transformation.',
    slug: 'local-business-growth'
  }
];

const Writing = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Writing</h1>
          <p className="text-slate-600">
            Thoughts on business, technology, and productivity.
          </p>
        </motion.div>

        <div className="space-y-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border-b border-slate-200 pb-8 last:border-0"
            >
              <p className="text-sm text-slate-500 mb-2">{post.date}</p>
              <h2 className="text-xl font-bold mb-2 hover:text-primary-600 cursor-pointer">
                {post.title}
              </h2>
              <p className="text-slate-600">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Writing;
