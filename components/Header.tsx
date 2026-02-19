"use client";

import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NB
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li><Link href="/work" className="text-slate-600 hover:text-primary-600 transition-colors">Work</Link></li>
            <li><Link href="/writing" className="text-slate-600 hover:text-primary-600 transition-colors">Writing</Link></li>
            <li><Link href="/contact" className="text-slate-600 hover:text-primary-600 transition-colors">Contact</Link></li>
          </ul>
        </nav>

        <Link 
          href="https://bleukei.com"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          BLEUKEI →
        </Link>
      </div>
    </header>
  );
};

export default Header;
