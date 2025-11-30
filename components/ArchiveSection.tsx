import React, { useState } from "react";
import { motion } from "framer-motion";
import { Story } from "../types";
import { mockStories } from "../data/mockData";
import { buildHeroCandidates } from "../utils/images";
import {
  archiveCardContainer,
  archiveCardImage,
  archiveBadgeDot,
  anthologyYearBadge,
} from "./ui/classes";
import Button from "./ui/Button";

const toSafeImageUrl = (url: string) => {
  if (url.startsWith("https://images.unsplash.com/")) {
    const u = new URL(url);
    u.searchParams.set("fm", "webp");
    u.searchParams.set("q", "80");
    if (!u.searchParams.get("w")) u.searchParams.set("w", "1600");
    return "/unsplash" + u.pathname + (u.search ? u.search : "");
  }
  if (url.startsWith("https://commons.wikimedia.org")) {
    return url.replace("https://commons.wikimedia.org", "/commons");
  }
  if (url.startsWith("https://upload.wikimedia.org")) {
    return url.replace("https://upload.wikimedia.org", "/upload");
  }
  return url;
};

const buildSrcSet = (url: string) => {
  if (!url.startsWith("https://images.unsplash.com/")) return undefined;
  const widths = [480, 768, 1024, 1600];
  return widths
    .map((w) => {
      const u = new URL(url);
      u.searchParams.set("w", String(w));
      u.searchParams.set("fm", "webp");
      u.searchParams.set("q", "80");
      const proxied = "/unsplash" + u.pathname + (u.search ? u.search : "");
      return `${proxied} ${w}w`;
    })
    .join(", ");
};

const resolveHeroImage = (story: Story) => {
  if (story.id === "massa-2008") {
    return toSafeImageUrl(
      "https://commons.wikimedia.org/wiki/Special:FilePath/Massa%20Brazil%202008%20Podium.jpg"
    );
  }
  return toSafeImageUrl(story.heroImage);
};

 

interface ArchiveSectionProps {
  onStorySelect: (story: Story) => void;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({ onStorySelect }) => {
  return (
    <section className="relative z-20 px-4 md:px-8 lg:px-12 py-24 max-w-[1920px] mx-auto bg-f1-black">
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8 gap-8">
        <div className="space-y-4">
          <h2 className="font-serif text-5xl md:text-7xl text-white leading-[0.9] tracking-tight">
            The Archive
          </h2>
          <p className="font-mono text-[10px] md:text-xs text-f1-red uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2 h-2 bg-f1-red rounded-full animate-pulse shadow-[0_0_10px_#ff1801]" />
            Sector 2 /// Classified Historical Records
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">
          {["Legend", "Rivalry", "Tragedy", "Myth"].map((filter) => (
            <Button key={filter} variant="anthology">
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* CHAOTIC MASONRY GRID */}
      {/* 
         Using Tailwind Grid to create an asymmetrical, editorial layout.
         First item is big (Hero).
         Fourth item is wide (Banner).
         Others are standard cards.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 auto-rows-[500px] lg:auto-rows-[600px]">
        {mockStories.map((story, index) => {
          // Dynamic Spanning Logic
          let spanClass = "lg:col-span-4"; // Default: 1/3 width

          if (index === 0)
            spanClass = "lg:col-span-8 md:col-span-2"; // First item: 2/3 width
          else if (index === 3)
            spanClass =
              "lg:col-span-12 md:col-span-2 !h-[400px]"; // 4th item: Full width banner
          else if (index === 4 || index === 5) spanClass = "lg:col-span-6"; // 5th/6th: Half width

          return (
            <ArchiveCard
              key={story.id}
              story={story}
              index={index}
              spanClass={spanClass}
              onClick={() => onStorySelect(story)}
            />
          );
        })}
      </div>
    </section>
  );
};

// --- ARCHIVE CARD COMPONENT ---
// Pure Tailwind CSS implementation. No external stylesheets.

const ArchiveCard: React.FC<{
  story: Story;
  index: number;
  spanClass: string;
  onClick: () => void;
}> = React.memo(({ story, index, spanClass, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const heroRaw = resolveHeroImage(story);
  const candidates = React.useMemo(() => buildHeroCandidates(heroRaw, story.id), [heroRaw, story.id]);
  return (
    <motion.div
      layoutId={`card-container-${story.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.05 }}
      className={`${archiveCardContainer} ${spanClass}`}
    >
      {/* 1. IMAGE LAYER */}
      <div className="absolute inset-0 overflow-hidden">
        {!loaded && !error && (
          <div className="absolute inset-0 bg-[#0f0f0f] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl" />
          </div>
        )}
        {!error && (
          <motion.img
            layoutId={`hero-image-${story.id}`}
            src={candidates[Math.min(candidateIndex, Math.max(0, candidates.length - 1))]}
            srcSet={buildSrcSet(heroRaw)}
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            alt={`${story.title} — ${story.year}`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : index < 3 ? "high" : "low"}
            referrerPolicy="no-referrer"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => {
              const next = candidateIndex + 1;
              if (next < candidates.length) { setCandidateIndex(next); return; }
              setError(true);
            }}
            className={`${loaded ? archiveCardImage : "opacity-0"} ${
              loaded ? "" : ""
            }`}
          />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111] text-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-[#ff1801]" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                Görsel mevcut değil
              </span>
            </div>
          </div>
        )}

        {/* Cinematic Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-f1-black/20 to-f1-black opacity-90" />

        {/* Technical Grid Overlay (Scanlines) */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#000_3px)] bg-[length:100%_4px] opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-500 mix-blend-overlay" />
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-20">
        {/* Top Meta (Reveals on Hover) */}
        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out delay-100">
          <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10">
            <span className={archiveBadgeDot} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white">
              Rec_0{index + 1}
            </span>
          </div>
          <span className="font-mono text-[9px] text-gray-400 border border-white/10 px-2 py-1 bg-black/60 backdrop-blur-sm">
            {story.id.toUpperCase().slice(0, 8)}...
          </span>
        </div>

        {/* Bottom Text */}
        <div className="transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
          <motion.div
            layoutId={`subtitle-${story.id}`}
            className="flex items-center gap-3 mb-3"
          >
            <span className={anthologyYearBadge}>{story.year}</span>
            <span className="h-[1px] flex-grow bg-white/10 group-hover:bg-white/30 transition-colors duration-500" />
            <span className="font-mono text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.2em]">
              {story.category}
            </span>
          </motion.div>

          <motion.h3
            layoutId={`title-${story.id}`}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-[0.9] mb-3 group-hover:text-white mix-blend-screen transition-all duration-500"
          >
            {story.title}
          </motion.h3>

          <p className="font-serif text-xs md:text-sm text-gray-300 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 leading-[1.6] border-l border-[#ff1801] pl-3">
            {story.subtitle}
          </p>
        </div>
      </div>

      {/* 3. DECORATIVE UI ELEMENTS */}
      {/* Bottom Red Line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-f1-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left" />

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
});

export default ArchiveSection;
