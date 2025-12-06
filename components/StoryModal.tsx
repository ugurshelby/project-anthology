import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Story, StoryContent } from '../types';
import { buildHeroCandidates, buildContentCandidates, buildLocalResponsiveSrcSet, defaultSizes, aspectForLayout, getLocalWebpPath, getUnsplashVariant } from '../utils/images';

interface StoryModalProps {
  story: Story;
  onClose: () => void;
}

const toSafeImageUrl = (url: string) => {
  if (url.startsWith('https://images.unsplash.com/')) {
    const u = new URL(url);
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '80');
    if (!u.searchParams.get('w')) u.searchParams.set('w', '1600');
    return '/unsplash' + u.pathname + (u.search ? u.search : '');
  }
  if (url.startsWith('https://commons.wikimedia.org')) {
    return url.replace('https://commons.wikimedia.org', '/commons');
  }
  if (url.startsWith('https://upload.wikimedia.org')) {
    return url.replace('https://upload.wikimedia.org', '/upload');
  }
  return url;
};

const buildSrcSet = (url: string) => {
  if (!url.startsWith('https://images.unsplash.com/')) return undefined;
  const widths = [640, 1024, 1440, 1920];
  return widths
    .map((w) => {
      const u = new URL(url);
      u.searchParams.set('w', String(w));
      u.searchParams.set('fm', 'webp');
      u.searchParams.set('q', '80');
      const proxied = '/unsplash' + u.pathname + (u.search ? u.search : '');
      return `${proxied} ${w}w`;
    })
    .join(', ');
};

const resolveHeroImage = (story: Story) => {
  if (story.id === 'massa-2008') {
    return toSafeImageUrl('https://images.unsplash.com/photo-1541601945533-660bfbe6d3e0?q=80&w=1600&auto=format&fit=crop');
  }
  return toSafeImageUrl(story.heroImage);
};

// HELPER: Group content by headings for sticky section navigation
const groupContentByHeadings = (content: StoryContent[]) => {
  const sections: { title: string | null; blocks: StoryContent[] }[] = [];
  let currentSection: { title: string | null; blocks: StoryContent[] } = { title: null, blocks: [] };

  content.forEach((item) => {
    if (item.type === 'heading') {
      if (currentSection.blocks.length > 0) sections.push(currentSection);
      currentSection = { title: item.text, blocks: [] };
    } else {
      currentSection.blocks.push(item);
    }
  });
  if (currentSection.blocks.length > 0) sections.push(currentSection);
  return sections;
};

const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. PROGRESS BAR LOGIC
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // 2. PARALLAX HERO LOGIC
  // We track the scroll relative to the container.
  // Since the Hero is 'sticky', we use transforms to create the illusion of depth.
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"] // Track while hero is in viewport
  });

  const heroResolved = resolveHeroImage(story);
  const heroCandidates = useMemo(() => buildHeroCandidates(heroResolved, story.id), [heroResolved, story.id]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSrc = heroCandidates[Math.min(heroIndex, Math.max(0, heroCandidates.length - 1))];

  // IMAGE LAYER: Moves slowly down (0% -> 25%) creating "distance"
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  // SCALE: Subtle zoom to enhance drama
  const heroScale = useTransform(heroScroll, [0, 1], [1.1, 1.25]);
  // BLUR: Simulates camera focus shifting to text
  const heroBlur = useTransform(heroScroll, [0, 0.5], ["blur(0px)", "blur(12px)"]);
  // DIM: Darkens image so text becomes readable
  const heroDim = useTransform(heroScroll, [0, 0.6], [0, 0.7]);

  // TEXT LAYER: Moves slightly upward/fades faster than background to separate planes
  const textY = useTransform(heroScroll, [0, 1], ["0%", "-50%"]);
  const textOpacity = useTransform(heroScroll, [0, 0.4], [1, 0]);

  const sections = useMemo(() => groupContentByHeadings(story.content), [story.content]);

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-f1-black flex flex-col text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* PROGRESS BAR */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-[70]">
        <motion.div className="h-full bg-f1-red" style={{ scaleX, transformOrigin: "0%" }} />
      </div>

      {/* NAVIGATION OVERLAY */}
      <nav className="absolute top-0 w-full p-6 md:p-8 flex justify-between items-start z-[60] mix-blend-difference pointer-events-none">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">Archival Record</span>
          <span className="font-mono text-xs uppercase tracking-widest text-white font-bold mt-1">{story.id.toUpperCase()}</span>
        </div>
        <button 
          onClick={onClose}
          className="pointer-events-auto group flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-white hover:text-f1-red transition-colors duration-300"
        >
          <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-f1-red">[ ESC ]</span>
          <span className="border-b border-transparent group-hover:border-[#ff1801]">CLOSE</span>
        </button>
      </nav>

      {/* MAIN SCROLL CONTAINER */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative perspective-1 bg-f1-black hide-scrollbar"
      >
        
        {/* PARALLAX HERO SECTION */}
        <div ref={heroRef} className="relative h-[95vh] w-full overflow-hidden sticky top-0 z-0">
          
          {/* 1. Background Image Layer */}
          <motion.div 
            style={{ y: heroY, scale: heroScale, filter: heroBlur }} 
            className="absolute inset-0 w-full h-full origin-center will-change-transform"
          >
            <picture className="block w-full h-full aspect-[16/9]">
              {heroResolved.startsWith('https://images.unsplash.com/') ? (
                <>
                  <source media="(max-width: 640px)" srcSet={toSafeImageUrl(heroResolved).replace(/w=1600/, 'w=480')} type="image/webp" />
                  <source media="(max-width: 1024px)" srcSet={toSafeImageUrl(heroResolved).replace(/w=1600/, 'w=1024')} type="image/webp" />
                </>
              ) : (
                <>
                  <source media="(max-width: 640px)" srcSet={getLocalWebpPath(heroResolved, 480)} type="image/webp" />
                  <source media="(max-width: 1024px)" srcSet={getLocalWebpPath(heroResolved, 1024)} type="image/webp" />
                </>
              )}
              <img 
                src={heroSrc} 
                className="w-full h-full object-cover"
                alt="Hero"
                onError={() => setHeroIndex((i) => i + 1)}
              />
            </picture>
            {/* Gradient Overlays for text readability */}
            <motion.div 
              style={{ opacity: heroDim }}
              className="absolute inset-0 bg-f1-black" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-f1-black via-transparent to-black/30" />
          </motion.div>

          {/* 2. Text Layer (Moves at different speed than image) */}
          <motion.div 
             style={{ y: textY, opacity: textOpacity }}
             className="absolute bottom-0 left-0 w-full p-6 md:p-24 z-10 pointer-events-none flex flex-col justify-end h-full pb-32"
          >
            <div className="max-w-6xl w-full">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <span className="px-3 py-1 border border-f1-red text-f1-red font-mono text-[10px] uppercase tracking-widest bg-f1-red/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,24,1,0.3)]">
                  {story.year}
                </span>
                <span className="font-mono text-xs text-gray-300 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1 h-1 bg-gray-300 rounded-full" /> {story.category}
                </span>
              </div>
              
              <h1 className="font-serif text-[15vw] md:text-8xl lg:text-9xl leading-[0.8] text-white tracking-tight mb-8 drop-shadow-2xl mix-blend-overlay opacity-90">
                {story.title}
              </h1>
              
              <p className="font-sans text-lg md:text-2xl text-gray-200 max-w-2xl leading-relaxed border-l-2 border-f1-red pl-6 md:pl-8 backdrop-blur-sm">
                {story.subtitle}
              </p>
            </div>
          </motion.div>
        </div>

        {/* 3. CONTENT LAYER (The Paper) */}
        {/* Negative margin pulls this UP over the sticky hero */}
        <div className="relative z-20 bg-f1-black min-h-screen pt-24 md:pt-32 pb-48 -mt-24 md:-mt-32 shadow-[0_-50px_100px_rgba(0,0,0,1)]">
          <div className="max-w-screen-xl mx-auto px-6">
            
            {sections.map((section, idx) => (
              <section key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 mb-24 border-t border-white/5 pt-16 first:border-none first:pt-0">
                
                {/* Sticky Chapter Marker */}
                <div className="md:col-span-4 relative">
                  <div className="sticky top-32 transition-all duration-500 bg-f1-black/80 backdrop-blur-md p-6 -ml-6 rounded-lg border border-white/5">
                    <span className="block font-mono text-[9px] text-f1-red mb-2 uppercase tracking-[0.2em]">
                      {section.title ? `Sequence 0${idx + 1}` : 'Prologue'}
                    </span>
                    {section.title && (
                      <h2 className="font-serif text-3xl md:text-4xl text-white leading-none mb-4">
                        {section.title}
                      </h2>
                    )}
                    <div className="w-12 h-[1px] bg-white/20" />
                  </div>
                </div>

                {/* Content Body */}
                <div className="md:col-span-7 md:col-start-6 space-y-12">
                  {section.blocks.map((block, bIdx) => (
                    <ContentBlock key={bIdx} block={block} isFirst={idx === 0 && bIdx === 0} year={story.year} />
                  ))}
                </div>
              </section>
            ))}

            {/* Footer/End Marker */}
            <div className="flex flex-col items-center justify-center pt-32 opacity-30 hover:opacity-60 transition-opacity duration-500 gap-4">
              <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white to-transparent" />
              <div className="font-serif text-2xl italic">End of Record</div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENTS (Modular & Animated) ---

const ContentBlock: React.FC<{ block: StoryContent; isFirst: boolean; year: string }> = ({ block, isFirst, year }) => {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock text={block.text} isFirst={isFirst} />;
    case 'quote':
      return <QuoteBlock text={block.text} author={block.author} />;
    case 'image':
      return <ImageBlock src={block.src} caption={block.caption} layout={block.layout} year={year} />;
    case 'heading':
      return null; // Handled in parent grouping
    default:
      return null;
  }
};

const ParagraphBlock: React.FC<{ text: string; isFirst: boolean }> = React.memo(({ text, isFirst }) => (
  <p className={`font-sans text-lg md:text-xl text-[#d4d4d4] leading-[1.7] font-light tracking-wide antialiased
    ${isFirst 
      ? 'first-letter:float-left first-letter:text-6xl md:first-letter:text-8xl first-letter:font-serif first-letter:text-white first-letter:mr-4 first-letter:mt-[-10px] first-letter:leading-[0.8]' 
      : ''}
  `}>
    {text}
  </p>
));

const QuoteBlock: React.FC<{ text: string; author: string }> = React.memo(({ text, author }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  
  return (
    <motion.figure 
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative py-8 my-12 pl-6 md:pl-10 border-l-2 border-f1-red bg-white/[0.02]"
    >
      <blockquote className="font-serif text-2xl md:text-3xl text-white leading-tight italic">
        "{text}"
      </blockquote>
      <figcaption className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10 w-fit">
        <span className="font-mono text-[10px] text-f1-red uppercase tracking-widest font-bold">{author}</span>
      </figcaption>
    </motion.figure>
  );
});

 

const ImageBlock: React.FC<{ src: string; caption: string; layout: 'full' | 'portrait' | 'landscape'; year: string }> = React.memo(({ src, caption, layout, year }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = useMemo(() => buildContentCandidates(src, caption), [src, caption]);

  // Layout logic: Break the grid for full width images
  const containerClass = layout === 'full' 
    ? 'w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] md:w-[120%] md:left-auto md:right-auto md:-ml-[15%]' 
    : 'w-full';

  return (
    <div ref={ref} className={`my-20 ${containerClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 1, ease: "circOut" }}
        className="relative group"
      >
        {!errored && (
            <img 
            src={candidates[Math.min(candidateIndex, Math.max(0, candidates.length - 1))]} 
            srcSet={buildLocalResponsiveSrcSet(src)}
            sizes={defaultSizes.modal}
            alt={caption} 
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            fetchPriority="low"
            width={aspectForLayout(layout).width}
            height={aspectForLayout(layout).height}
            onLoad={() => setLoaded(true)}
            onError={() => {
              const next = candidateIndex + 1;
              if (next < candidates.length) { setCandidateIndex(next); return; }
              setErrored(true);
            }}
            className={`w-full h-auto object-cover max-h-[80vh] ${parseInt(year) <= 1980 ? 'sepia-[15%] contrast-[1.0]' : parseInt(year) <= 2005 ? 'grayscale-[20%] contrast-[1.05]' : 'grayscale-[10%] contrast-[1.1]'} group-hover:grayscale-0 transition-all duration-[1500ms] ease-out ${loaded ? '' : 'opacity-0'}`}
          />
        )}
        {!loaded && !errored && (
          <div className="absolute inset-0 bg-[#0e0e0e] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl" />
          </div>
        )}
        {errored && (
          <div className="w-full min-h-[260px] md:min-h-[420px] bg-[#111] flex items-end">
            <div className="w-full p-4 flex justify-between items-end">
              <p className="font-mono text-[10px] text-white uppercase tracking-widest">FIG_Ref: {caption}</p>
              <span className="font-mono text-[10px] text-gray-400">Image unavailable</span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex justify-between items-end">
           <p className="font-mono text-[10px] text-white uppercase tracking-widest">
             FIG_Ref: {caption}
           </p>
           <div className="h-[1px] w-12 bg-f1-red" />
        </div>
      </motion.div>
    </div>
  );
});

export default StoryModal;
