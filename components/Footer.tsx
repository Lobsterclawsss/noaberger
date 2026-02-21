import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/10 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="font-bold text-lg text-white">Noa Berger</p>
            <p className="text-secondary text-sm">Operator &amp; Investor</p>
          </div>

          <div className="flex space-x-6">
            <Link href="https://www.linkedin.com/in/noabberger/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-white transition-colors text-sm">LinkedIn</Link>
            <Link href="https://www.instagram.com/noableu/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-white transition-colors text-sm">Instagram</Link>
            <a href="mailto:NB@noaberger.com" className="text-secondary hover:text-white transition-colors text-sm">Email</a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-secondary text-sm">
          <p>© {new Date().getFullYear()} Noa Berger. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;