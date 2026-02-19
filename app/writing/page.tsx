"use client";

import { motion } from 'framer-motion';

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
            Thoughts on business, technology, and building things.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-slate-200 rounded-xl p-12 text-center"
        >
          <div className="text-5xl mb-6">✍️</div>
          <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            I'm working on writing about AI systems, operations, and what I've learned building businesses. Check back soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Writing;
