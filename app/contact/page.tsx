import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — Noa Berger',
  description: 'Get in touch with Noa Berger. Schedule a call, send an email, or connect on LinkedIn.',
  openGraph: {
    title: 'Contact — Noa Berger',
    description: 'Get in touch with Noa Berger. Schedule a call, send an email, or connect on LinkedIn.',
  },
};

const Contact = () => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-2xl">
        <h1 className="fade-in text-4xl md:text-5xl font-bold mb-4 text-white">Get in Touch</h1>
        <p className="fade-in-1 text-secondary text-lg mb-16">
          Have a project in mind or want to connect? Here&apos;s how to reach me.
        </p>

        <div className="fade-in-2 space-y-6">
          <a
            href="mailto:NB@noaberger.com"
            className="flex items-center justify-between border border-white/10 rounded-xl p-6 bg-surface hover:border-teal/40 transition-colors duration-200 group"
          >
            <div>
              <p className="text-sm text-secondary mb-1">Email</p>
              <p className="text-white font-medium">NB@noaberger.com</p>
            </div>
            <span className="text-secondary group-hover:text-teal transition-colors">→</span>
          </a>

          <Link
            href="https://calendar.app.google/9HkGH8jzjx82fwfk8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-white/10 rounded-xl p-6 bg-surface hover:border-teal/40 transition-colors duration-200 group"
          >
            <div>
              <p className="text-sm text-secondary mb-1">Schedule a Call</p>
              <p className="text-white font-medium">Book a 30-minute intro call</p>
            </div>
            <span className="text-secondary group-hover:text-teal transition-colors">→</span>
          </Link>

          <Link
            href="https://www.linkedin.com/in/noabberger/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-white/10 rounded-xl p-6 bg-surface hover:border-teal/40 transition-colors duration-200 group"
          >
            <div>
              <p className="text-sm text-secondary mb-1">LinkedIn</p>
              <p className="text-white font-medium">linkedin.com/in/noabberger</p>
            </div>
            <span className="text-secondary group-hover:text-teal transition-colors">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;