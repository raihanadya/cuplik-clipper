import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { title: 'Cara Kerja', href: '/#how-it-works' },
    { title: 'Fitur', href: '/#features' },
    { title: 'Template Layout', href: '/#templates' },
    { title: 'FAQ', href: '/#faq' },
  ];

  const menuItemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 w-full transition-all duration-200 border-b',
        scrolled
          ? 'bg-[#F7F5F0]/90 backdrop-blur-md border-[#DEDAD2] shadow-xs'
          : 'bg-transparent border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - Uses authentic Cuplik Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A] rounded-lg">
          <img
            src="/cuplik-logo.png"
            alt="Cuplik Logo"
            className="h-9 w-auto max-w-[130px] object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigasi Utama">
          {navLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              className="text-sm font-medium text-[#6F6B63] hover:text-[#242321] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A] rounded-md px-1 py-0.5"
            >
              {link.title}
            </a>
          ))}
        </nav>

        {/* Desktop Auth CTAs - Without magnetic effect on navbar button */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}>
              <Button size="sm" variant="primary" className="gap-1.5 font-medium">
                Buka Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button size="sm" variant="ghost" className="text-[#6F6B63] hover:text-[#242321]">
                  Masuk
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                {/* Regular button without magnetic property */}
                <Button size="sm" variant="primary" magnetic={false}>
                  Mulai Cuplik
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle with animated icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl text-[#6F6B63] hover:text-[#242321] hover:bg-[#FCFBF8] border border-transparent hover:border-[#DEDAD2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A]"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu Dropdown - Restrained panel with staggered entrance */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-nav"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden border-b border-[#DEDAD2] bg-[#FCFBF8]/98 backdrop-blur-xl px-4 pt-2 pb-6 space-y-4 shadow-sm"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: prefersReducedMotion ? 0 : 0.05,
                  },
                },
              }}
              className="flex flex-col space-y-1"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.title}
                  variants={menuItemVariants}
                  href={link.href}
                  className="text-base font-medium text-[#242321] hover:text-[#C65D3A] py-2 px-1 transition-colors rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {link.title}
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.15, duration: 0.2 }}
              className="pt-3 border-t border-[#DEDAD2] flex flex-col gap-2.5"
            >
              {isAuthenticated ? (
                <Link
                  to={role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full justify-center">
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" className="w-full justify-center">
                      Masuk
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full justify-center" magnetic={false}>
                      Mulai Cuplik
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
