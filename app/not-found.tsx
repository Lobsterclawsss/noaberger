import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-teal text-sm font-medium tracking-widest uppercase mb-4">404</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-secondary leading-relaxed mb-10">
          This page doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-teal hover:bg-teal-hover text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
