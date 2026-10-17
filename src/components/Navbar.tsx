import { useEffect, useState } from 'react';
import { Cat, Coffee, Menu as MenuIcon, X, Heart, Home, Send, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useCurrency } from '@/lib/currency';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'menu', label: 'Menu', icon: Coffee },
  { id: 'cats', label: 'Our Cats', icon: Cat },
  { id: 'adopt', label: 'Adopt', icon: Heart },
  { id: 'contact', label: 'Contact', icon: Send },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream-50/90 backdrop-blur-md shadow-md shadow-rose-100/40 py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="section-padding flex items-center justify-between">
        <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-lavender-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Cat className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg text-warm-700 hidden sm:block">
            Whiskers & Whipped Cream
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                    : 'text-warm-600 hover:bg-rose-100 hover:text-rose-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(link.label)}
              </button>
            );
          })}
          <button
            onClick={() => handleNav('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ml-2 ${
              currentPage === 'admin'
                ? 'bg-warm-500 text-white shadow-md shadow-warm-200'
                : 'text-warm-500 hover:bg-warm-100 hover:text-warm-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t('Staff')}
          </button>
          <div className="flex items-center gap-1 ml-2 rounded-full bg-white/70 p-1">
            <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${language === 'en' ? 'bg-warm-500 text-white' : 'text-warm-500'}`}>EN</button>
            <button onClick={() => setLanguage('mk')} className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${language === 'mk' ? 'bg-warm-500 text-white' : 'text-warm-500'}`}>MK</button>
            <button onClick={() => setCurrency(currency === 'USD' ? 'MKD' : 'USD')} className="px-2 py-1 rounded-full text-xs font-bold text-warm-500">{currency}</button>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 mx-4 bg-white rounded-3xl shadow-lg shadow-rose-100 p-4 animate-scaleIn">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                    isActive ? 'bg-rose-400 text-white' : 'text-warm-600 hover:bg-rose-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(link.label)}
                </button>
              );
            })}
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                currentPage === 'admin' ? 'bg-warm-500 text-white' : 'text-warm-500 hover:bg-warm-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              {t('Staff Portal')}
            </button>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${language === 'en' ? 'bg-warm-500 text-white' : 'bg-rose-100 text-warm-500'}`}>EN</button>
              <button onClick={() => setLanguage('mk')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${language === 'mk' ? 'bg-warm-500 text-white' : 'bg-rose-100 text-warm-500'}`}>MK</button>
              <button onClick={() => setCurrency(currency === 'USD' ? 'MKD' : 'USD')} className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-warm-500">{currency}</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
