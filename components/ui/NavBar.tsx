import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

type NavBarVariant = 'overlay' | 'solid';

interface NavBarProps {
  /**
   * 'overlay' — transparent nav on top of hero; switches to blurred dark when scrolled.
   * 'solid'   — always the dark, blurred top bar (used by routed pages).
   */
  variant?: NavBarVariant;
  /**
   * When true, the sidebar drawer also renders the F1 category shortcuts
   * (Rivalry / Tragedy / Myth). Only used by the home Shell.
   */
  showCategories?: boolean;
}

const CATEGORIES = ['Rivalry', 'Tragedy', 'Myth'] as const;

const NavBar: React.FC<NavBarProps> = ({ variant = 'solid', showCategories = false }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== 'overlay') return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  const overlayClass =
    variant === 'overlay'
      ? scrolled
        ? 'bg-f1-black/95 backdrop-blur-md border-b border-white/10 text-white'
        : 'mix-blend-difference text-white'
      : 'bg-f1-black/95 backdrop-blur-md border-b border-white/10 text-white';

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 ${overlayClass}`}
        aria-label="Main navigation"
        initial={false}
        animate={
          variant === 'overlay'
            ? {
                backgroundColor: scrolled
                  ? 'rgba(10, 10, 10, 0.95)'
                  : 'rgba(0, 0, 0, 0)',
              }
            : { backgroundColor: 'rgba(10, 10, 10, 0.95)' }
        }
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button
          onClick={() => navigate('/')}
          className="font-condensed text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Go to home page"
          data-testid="home-button"
        >
          Project Anthology <span className="text-f1-red">///</span> EST. 2026
        </button>
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            type="button"
            variant="glow"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            data-testid="menu-button"
            className={`text-xs tracking-[0.2em] px-5 py-2.5 cursor-pointer ${
              isMenuOpen
                ? '!bg-f1-red !border-f1-red !text-white opacity-100 shadow-[0_0_12px_rgba(255,24,1,0.5)]'
                : ''
            }`}
          >
            Menu
          </Button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] sm:w-full max-w-md bg-f1-black border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                  <h2 className="font-display text-2xl text-white tracking-wide">Navigation</h2>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                    data-testid="menu-close"
                    className="font-condensed text-sm uppercase tracking-widest text-white hover:text-f1-red transition-colors p-2 -m-2"
                  >
                    Close
                  </button>
                </div>

                <nav className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                      Navigation
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/');
                          }}
                          className="font-condensed text-lg text-white hover:text-f1-red transition-colors w-full text-left tracking-wide"
                        >
                          Anthology
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/timeline');
                          }}
                          className="font-condensed text-lg text-white hover:text-f1-red transition-colors w-full text-left tracking-wide"
                        >
                          Timeline
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/news');
                          }}
                          onMouseEnter={() => {
                            // Prefetch news chunk + warm cache on hover
                            import('../News');
                            import('../../utils/newsService').then(({ fetchNews }) => {
                              fetchNews().catch(() => {});
                            });
                          }}
                          className="font-condensed text-lg text-white hover:text-f1-red transition-colors w-full text-left tracking-wide"
                        >
                          News
                        </button>
                      </li>
                    </ul>
                  </div>

                  {showCategories && (
                    <div>
                      <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        {CATEGORIES.map((category) => (
                          <li key={category}>
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                navigate(`/?category=${encodeURIComponent(category)}`);
                                setTimeout(() => {
                                  const archiveSection = document.querySelector('[data-archive-section]');
                                  if (archiveSection) {
                                    archiveSection.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }, 150);
                              }}
                              className="font-condensed text-lg text-white hover:text-f1-red transition-colors w-full text-left tracking-wide"
                            >
                              {category}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {showCategories && (
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                        About
                      </h3>
                      <p className="font-mono text-sm text-gray-400 leading-relaxed">
                        An archival project dedicated to the narrative history of Formula 1.
                        Not just the numbers, but the blood, sweat, and oil.
                      </p>
                    </div>
                  )}
                </nav>

                <div className="p-8 border-t border-white/10">
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                    Project Anthology <span className="text-f1-red">///</span> EST. 2026
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
