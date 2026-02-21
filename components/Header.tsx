import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-4xl">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          NB
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li><Link href="/about" className="text-secondary hover:text-white transition-colors text-sm">About</Link></li>
            <li><Link href="/work" className="text-secondary hover:text-white transition-colors text-sm">Work</Link></li>
            <li><Link href="/contact" className="text-secondary hover:text-white transition-colors text-sm">Contact</Link></li>
          </ul>
        </nav>

        <Link
          href="https://bleukei.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-teal hover:bg-teal-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          BLEUKEI →
        </Link>
      </div>
    </header>
  );
};

export default Header;