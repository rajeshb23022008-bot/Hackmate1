import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MotionButton } from '../ui/MotionButton';
import { Sparkles, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy-900/80 backdrop-blur-lg border-b border-navy-700/80 py-3 shadow-md'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            HACK<span className="text-blue-accent">MATE</span>
          </span>
        </Link>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <MotionButton variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              Sign In
            </MotionButton>
          </Link>
          <Link to="/signup">
            <MotionButton variant="primary" size="sm">
              Get Started
            </MotionButton>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-navy-900 border-b border-navy-700 px-6 py-4 space-y-3"
        >
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
            <MotionButton variant="secondary" size="md" className="w-full">
              Sign In
            </MotionButton>
          </Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block">
            <MotionButton variant="primary" size="md" className="w-full">
              Get Started
            </MotionButton>
          </Link>
        </motion.div>
      )}
    </header>
  );
}
