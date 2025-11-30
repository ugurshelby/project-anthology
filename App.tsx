import React, { useEffect, useState, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, useMatch, useNavigate } from 'react-router-dom';
const HeroSection = React.lazy(() => import('./components/HeroSection'));
const ArchiveSection = React.lazy(() => import('./components/ArchiveSection'));
const StoryModal = React.lazy(() => import('./components/StoryModal'));
import { Story } from './types';
import { mockStories } from './data/mockData';

// GLOBAL CRITIQUE & ARCHITECTURE NOTES:
// 1. Eliminated "Hybrid CSS". We are pure Tailwind/Framer Motion now.
// 2. Added a global "Noise" overlay to kill the digital flatness and give it film texture.
// 3. State management for the modal is lifted here to ensure the "Hero" and "Archive" can interact seamlessly.

const Shell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch('/story/:id');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const toSafe = (url: string) => {
    if (!url.startsWith('https://images.unsplash.com/')) return url;
    const u = new URL(url);
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '80');
    if (!u.searchParams.get('w')) u.searchParams.set('w', '1600');
    return '/unsplash' + u.pathname + (u.search ? u.search : '');
  };

  useEffect(() => {
    const id = match?.params?.id;
    if (id) {
      const story = mockStories.find((s) => s.id === id) || null;
      setActiveStory(story);
    } else {
      setActiveStory(null);
    }
  }, [match?.params?.id]);

  useEffect(() => {
    const heroes = mockStories.slice(0, 6).map((s) => s.heroImage);
    for (const u of heroes) {
      const img = new Image();
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = u;
    }
  }, []);

  const handleSelect = (story: Story) => {
    navigate(`/story/${story.id}`, { state: { backgroundLocation: location } });
  };

  const handleClose = () => {
    const state = location.state as any;
    if (state && state.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-f1-black text-paper selection:bg-f1-red selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
        <div className="absolute inset-[-200%] w-[400%] h-[400%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain"></div>
      </div>

      <nav className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-8 py-6 mix-blend-difference text-white">
        <div className="font-mono text-xs tracking-widest uppercase opacity-70">
          Project Anthology <span className="text-f1-red">///</span> EST. 2024
        </div>
        <div className="font-mono text-xs tracking-widest uppercase opacity-70">
          Menu
        </div>
      </nav>

      <main className="relative z-10">
        <Suspense fallback={<div />}> 
          <HeroSection />
          <ArchiveSection onStorySelect={handleSelect} />
        </Suspense>
      </main>

      <AnimatePresence>
        {activeStory && (
          <Suspense fallback={<div />}> 
            <StoryModal story={activeStory} onClose={handleClose} />
          </Suspense>
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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Shell />} />
      <Route path="/story/:id" element={<Shell />} />
    </Routes>
  );
};

export default App;
