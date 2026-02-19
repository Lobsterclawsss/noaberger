import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="font-bold text-lg">Noa Berger</p>
            <p className="text-slate-400 text-sm">Growth & Operations Consultant</p>
          </div>

          <div className="flex space-x-6">
            <Link href="https://linkedin.com" className="text-slate-400 hover:text-white transition-colors">LinkedIn</Link>
            <Link href="https://twitter.com" className="text-slate-400 hover:text-white transition-colors">Twitter</Link>
            <a href="mailto:NB@noaberger.com" className="text-slate-400 hover:text-white transition-colors">Email</a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Noa Berger. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
