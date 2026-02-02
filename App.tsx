import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation, useMatch, useNavigate } from 'react-router-dom';
const HeroSection = React.lazy(() => import('./components/HeroSection'));
const ArchiveSection = React.lazy(() => import('./components/ArchiveSection'));
const StoryModal = React.lazy(() => import('./components/StoryModal'));
const Timeline = React.lazy(() => import('./components/Timeline'));
const Gallery = React.lazy(() => import('./components/Gallery'));
const News = React.lazy(() => import('./components/News'));
import ErrorBoundary from './components/ErrorBoundary';
import ShortcutsModal from './components/ui/ShortcutsModal';
import OfflineIndicator from './components/OfflineIndicator';
import { Story, LocationState } from './types';
import { storyMetadata } from './data/storyMetadata';
import { createKeyboardShortcuts } from './utils/keyboardShortcuts';
import { preloadStoryHeroes } from './utils/imagePreloader';
import { getDesktopOptimizedImage } from './utils/optimizedImages';
import { useMetadata } from './hooks/useMetadata';
import metadata from './metadata.json';

// GLOBAL CRITIQUE & ARCHITECTURE NOTES:
// 1. Eliminated "Hybrid CSS". We are pure Tailwind/Framer Motion now.
// 2. Added a global "Noise" overlay to kill the digital flatness and give it film texture.
// 3. State management for the modal is lifted here to ensure the "Hero" and "Archive" can interact seamlessly.

const Shell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch('/story/:id');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleSelect = useCallback((story: Story) => {
    navigate(`/story/${story.id}`, { state: { backgroundLocation: location } });
  }, [navigate, location]);

  const handleClose = useCallback(() => {
    const state = location.state as LocationState | null;
    if (state?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const currentStoryIndex = activeStory 
      ? storyMetadata.findIndex(s => s.id === activeStory.id)
      : -1;
    
    const cleanup = createKeyboardShortcuts({
      onEscape: () => {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (activeStory) {
          handleClose();
        }
      },
      onArrowLeft: () => {
        if (activeStory && currentStoryIndex > 0) {
          const prevStory = storyMetadata[currentStoryIndex - 1];
          handleSelect({ ...prevStory, content: [] });
        }
      },
      onArrowRight: () => {
        if (activeStory && currentStoryIndex < storyMetadata.length - 1) {
          const nextStory = storyMetadata[currentStoryIndex + 1];
          handleSelect({ ...nextStory, content: [] });
        }
      },
      onSpace: () => {
        if (!activeStory && !isMenuOpen && !isShortcutsOpen) {
          window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'auto' });
        }
      },
      onQuestionMark: () => {
        setIsShortcutsOpen(prev => !prev);
      },
      onHome: () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      },
      onEnd: () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
      },
    });

    return cleanup;
  }, [activeStory, isMenuOpen, isShortcutsOpen, handleSelect, handleClose]);

  useEffect(() => {
    const id = match?.params?.id;
    if (id) {
      // Lazy load story content when story is opened
      import('./data/storyContent').then(({ storyContentMap }) => {
        const metadata = storyMetadata.find((s) => s.id === id);
        if (metadata) {
          const content = storyContentMap[id] || [];
          setActiveStory({ ...metadata, content });
        } else {
          setActiveStory(null);
        }
      }).catch(() => {
        setActiveStory(null);
      });
    } else {
      setActiveStory(null);
    }
  }, [match?.params?.id]);

  // Preload critical hero images - first 6 + new stories (23, 26, 29, 32, 35)
  useEffect(() => {
    const firstSix = storyMetadata.slice(0, 6).map((s) => {
      const originalPath = s.heroImage.startsWith('/') ? s.heroImage : `/${s.heroImage}`;
      return getDesktopOptimizedImage(originalPath, 'hero');
    });
    
    // New story hero images (schumacher-1994-spain, collins-fangio-1956, monaco-1982, jerez-1997, senna-donington-1993)
    const newStoryIds = ['schumacher-1994-spain', 'collins-fangio-1956', 'monaco-1982', 'jerez-1997', 'senna-donington-1993'];
    const newStoryHeroes = storyMetadata
      .filter(s => newStoryIds.includes(s.id))
      .map((s) => {
        const originalPath = s.heroImage.startsWith('/') ? s.heroImage : `/${s.heroImage}`;
        return getDesktopOptimizedImage(originalPath, 'hero');
      });
    
    preloadStoryHeroes([...firstSix, ...newStoryHeroes]);
  }, []);

  const isStoryView = !!activeStory;
  const pageTitle = isStoryView 
    ? `${activeStory.title} — ${metadata.name}`
    : `${metadata.name} — ${metadata.description}`;
  const pageDescription = isStoryView 
    ? activeStory.subtitle
    : metadata.description;

  // Use minimal metadata hook instead of react-helmet
  useMetadata({
    title: pageTitle,
    description: pageDescription,
    image: isStoryView && activeStory ? activeStory.heroImage : undefined,
    type: isStoryView ? 'article' : 'website',
  });

  return (
    <div className="relative min-h-screen bg-f1-black text-paper selection:bg-f1-red selection:text-white overflow-x-hidden">
      {/* Film Grain Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] mix-blend-overlay animate-grain will-change-transform"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Offline Indicator */}
      <OfflineIndicator />

      <motion.nav 
        className={`fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 text-white ${
          scrolled 
            ? 'bg-f1-black/95 backdrop-blur-md border-b border-white/10' 
            : 'mix-blend-difference'
        }`}
        aria-label="Main navigation"
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Go to home page"
          data-testid="home-button"
        >
          Project Anthology <span className="text-f1-red">///</span> EST. 2026
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            data-testid="menu-button"
          >
            Menu
          </button>
        </div>
      </motion.nav>

      <main className="relative z-10">
        <ErrorBoundary>
          <Suspense fallback={<div />}> 
            <HeroSection />
            <ArchiveSection onStorySelect={handleSelect} />
          </Suspense>
        </ErrorBoundary>
      </main>

      <AnimatePresence>
        {activeStory && (
          <ErrorBoundary>
            <Suspense fallback={<div />}> 
              <StoryModal story={activeStory} onClose={handleClose} onOpenMenu={() => { navigate('/'); setIsMenuOpen(true); }} onStorySelect={handleSelect} />
            </Suspense>
          </ErrorBoundary>
        )}
      </AnimatePresence>

      {/* Navigation Sidebar */}
      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sidebar - mobile: 85% width so backdrop strip is clickable */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] sm:w-full max-w-md bg-f1-black border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                  <h2 className="font-serif text-2xl text-white">Navigation</h2>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                    data-testid="menu-close"
                    className="font-mono text-sm uppercase tracking-widest text-white hover:text-f1-red transition-colors p-2 -m-2"
                  >
                    Close
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                      Navigation
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={() => {
                            navigate('/');
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          Anthology
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigate('/timeline');
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          Timeline
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigate('/gallery');
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          Gallery
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigate('/news');
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          News
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                      Categories
                    </h3>
                    <ul className="space-y-2">
                      {['Rivalry', 'Tragedy', 'Myth'].map((category) => (
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
                            className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">
                      About
                    </h3>
                    <p className="font-mono text-sm text-gray-400 leading-relaxed">
                      An archival project dedicated to the narrative history of Formula 1. 
                      Not just the numbers, but the blood, sweat, and oil.
                    </p>
                  </div>
                </nav>

                {/* Footer */}
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

      <footer className="relative z-10 py-24 px-8 border-t border-white/10 mt-24">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h2 className="font-serif text-4xl mb-4">The Pursuit of Speed</h2>
            <p className="font-mono text-sm text-gray-400 max-w-md">
              An archival project dedicated to the narrative history of Formula 1. 
              Not just the numbers, but the blood, sweat, and oil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const TimelineShell: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleSelect = useCallback((story: Story) => {
    navigate(`/story/${story.id}`);
  }, [navigate]);

  useMetadata({
    title: `Timeline — ${metadata.name}`,
    description: 'Chronological timeline of Formula 1 stories',
    type: 'website',
  });

  return (
    <div className="relative min-h-screen bg-f1-black text-paper selection:bg-f1-red selection:text-white overflow-x-hidden">
      
      <motion.nav 
        className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 text-white bg-f1-black/95 backdrop-blur-md border-b border-white/10"
        aria-label="Main navigation"
      >
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Go to home page"
          data-testid="home-button"
        >
          Project Anthology <span className="text-f1-red">///</span> EST. 2026
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          data-testid="menu-button"
        >
          Menu
        </button>
      </motion.nav>

      <Suspense fallback={<div className="min-h-screen bg-f1-black" />}>
        <ErrorBoundary>
          <Timeline onStorySelect={handleSelect} onClose={() => navigate('/')} />
        </ErrorBoundary>
      </Suspense>

      {/* Navigation Sidebar */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-f1-black border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                  <h2 className="font-serif text-2xl text-white">Navigation</h2>
                </div>

                <nav className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">Navigation</h3>
                    <ul className="space-y-2">
                      <li>
                        <button onClick={() => { navigate('/'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Anthology</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/timeline'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Timeline</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/gallery'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Gallery</button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { navigate('/news'); }} 
                          onMouseEnter={() => {
                            // Prefetch news data and component on hover
                            import('./components/News');
                            import('./utils/newsService').then(({ fetchNews }) => {
                              // Prefetch cache check - non-blocking
                              fetchNews().catch(() => {});
                            });
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          News
                        </button>
                      </li>
                    </ul>
                  </div>
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
    </div>
  );
};

const GalleryShell: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useMetadata({
    title: `Gallery — ${metadata.name}`,
    description: 'Visual gallery of Formula 1 stories',
    type: 'website',
  });

  return (
    <div className="relative min-h-screen bg-f1-black text-paper selection:bg-f1-red selection:text-white overflow-x-hidden">
      
      <motion.nav 
        className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 text-white bg-f1-black/95 backdrop-blur-md border-b border-white/10"
        aria-label="Main navigation"
      >
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Go to home page"
          data-testid="home-button"
        >
          Project Anthology <span className="text-f1-red">///</span> EST. 2026
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          data-testid="menu-button"
        >
          Menu
        </button>
      </motion.nav>

      <Suspense fallback={<div className="min-h-screen bg-f1-black" />}>
        <ErrorBoundary>
          <Gallery onClose={() => navigate('/')} />
        </ErrorBoundary>
      </Suspense>

      {/* Navigation Sidebar */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-f1-black border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                  <h2 className="font-serif text-2xl text-white">Navigation</h2>
                </div>

                <nav className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">Navigation</h3>
                    <ul className="space-y-2">
                      <li>
                        <button onClick={() => { navigate('/'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Anthology</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/timeline'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Timeline</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/gallery'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Gallery</button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { navigate('/news'); }} 
                          onMouseEnter={() => {
                            // Prefetch news data and component on hover
                            import('./components/News');
                            import('./utils/newsService').then(({ fetchNews }) => {
                              // Prefetch cache check - non-blocking
                              fetchNews().catch(() => {});
                            });
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          News
                        </button>
                      </li>
                    </ul>
                  </div>
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
    </div>
  );
};

const NewsShell: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useMetadata({
    title: `News — ${metadata.name}`,
    description: 'Latest Formula 1 news and headlines',
    type: 'website',
  });

  return (
    <div className="relative min-h-screen bg-f1-black text-paper selection:bg-f1-red selection:text-white overflow-x-hidden">
      
      <motion.nav 
        className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 text-white bg-f1-black/95 backdrop-blur-md border-b border-white/10"
        aria-label="Main navigation"
      >
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Go to home page"
          data-testid="home-button"
        >
          Project Anthology <span className="text-f1-red">///</span> EST. 2026
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="font-mono text-xs tracking-widest uppercase opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black rounded px-2 py-1 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          data-testid="menu-button"
        >
          Menu
        </button>
      </motion.nav>

      <Suspense fallback={<div className="min-h-screen bg-f1-black" />}>
        <ErrorBoundary>
          <News onClose={() => navigate('/')} />
        </ErrorBoundary>
      </Suspense>

      {/* Navigation Sidebar */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-f1-black border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                  <h2 className="font-serif text-2xl text-white">Navigation</h2>
                </div>

                <nav className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-f1-red uppercase tracking-widest mb-4">Navigation</h3>
                    <ul className="space-y-2">
                      <li>
                        <button onClick={() => { navigate('/'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Anthology</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/timeline'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Timeline</button>
                      </li>
                      <li>
                        <button onClick={() => { navigate('/gallery'); }} className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left">Gallery</button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { navigate('/news'); }} 
                          onMouseEnter={() => {
                            // Prefetch news data and component on hover
                            import('./components/News');
                            import('./utils/newsService').then(({ fetchNews }) => {
                              // Prefetch cache check - non-blocking
                              fetchNews().catch(() => {});
                            });
                          }}
                          className="font-serif text-lg text-white hover:text-f1-red transition-colors w-full text-left"
                        >
                          News
                        </button>
                      </li>
                    </ul>
                  </div>
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Shell />} />
      <Route path="/story/:id" element={<Shell />} />
      <Route path="/timeline" element={<TimelineShell />} />
      <Route path="/gallery" element={<GalleryShell />} />
      <Route path="/news" element={<NewsShell />} />
    </Routes>
  );
};

export default App;
