import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Story } from '../types';
import { storyMetadata } from '../data/storyMetadata';
import { getDesktopOptimizedImage, getMobileOptimizedImage } from '../utils/optimizedImages';
import ImageShimmer from './ui/ImageShimmer';

interface TimelineProps {
  onStorySelect: (story: Story) => void;
  onClose?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ onStorySelect, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // Sort stories by year
  const sortedStories = [...storyMetadata].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
  // Group by decade for better visualization
  const storiesByDecade = sortedStories.reduce((acc, story) => {
    const decade = Math.floor(parseInt(story.year) / 10) * 10;
    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(story);
    return acc;
  }, {} as Record<number, typeof storyMetadata>);

  const decades = Object.keys(storiesByDecade)
    .map(Number)
    .sort((a, b) => a - b);

  const handleStoryClick = (story: Story) => {
    onStorySelect({ ...story, content: [] });
  };

  const handleImageLoad = (storyId: string) => {
    setImageLoaded(prev => ({ ...prev, [storyId]: true }));
  };

  return (
    <div className="relative min-h-screen bg-f1-black text-white py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Chronological Timeline</h1>
          <p className="font-mono text-sm md:text-base text-gray-400 uppercase tracking-widest">
            The narrative history of Formula 1
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative" ref={containerRef} style={{ position: 'relative' }}>
          {/* Vertical line - continuous line, will be visually broken by decade labels */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-gradient-to-b from-f1-red via-f1-red/40 to-transparent z-0" />

          {/* Stories grouped by decade */}
          <div className="space-y-24 lg:space-y-40">
            {decades.map((decade, decadeIndex) => (
              <motion.div
                key={decade}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: decadeIndex * 0.1 }}
                className="relative"
              >
                {/* Decade label with line break */}
                <div className="mb-20 lg:mb-28 relative">
                  <div className="flex items-center justify-center">
                    {/* Decade label with background to visually break the line */}
                    <div className="relative z-20">
                      <div className="flex items-center gap-6">
                        <div className="hidden lg:block w-32 h-[2px] bg-gradient-to-r from-transparent via-f1-red/30 to-f1-red/50" />
                        {/* Label with background that covers the line */}
                        <div className="relative">
                          {/* Background to break the line */}
                          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-f1-black -z-10" />
                          <span className="font-mono text-xl md:text-2xl lg:text-3xl text-f1-red uppercase tracking-[0.4em] whitespace-nowrap px-8 py-4 bg-f1-black border-2 border-f1-red/60 shadow-lg shadow-f1-red/40">
                            {decade}s
                          </span>
                        </div>
                        <div className="hidden lg:block w-32 h-[2px] bg-gradient-to-l from-transparent via-f1-red/30 to-f1-red/50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stories in this decade */}
                <div className="space-y-24 lg:space-y-32">
                  {storiesByDecade[decade].map((story, storyIndex) => {
                    const isEven = storyIndex % 2 === 0;
                    const heroImage = getDesktopOptimizedImage(story.heroImage, 'hero');
                    const heroImageMobile = getMobileOptimizedImage(story.heroImage, 'hero');
                    const isImageLoaded = imageLoaded[story.id];

                    return (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: storyIndex * 0.08 }}
                        className="relative lg:min-h-[400px]"
                        onMouseEnter={() => setSelectedYear(story.year)}
                        onMouseLeave={() => setSelectedYear(null)}
                      >
                        {/* Timeline dot - desktop only */}
                        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 z-30 top-1/2 -translate-y-1/2">
                          <motion.div
                            className="relative"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Outer glow */}
                            <div className="absolute inset-0 -m-2 rounded-full bg-f1-red/20 blur-md" />
                            {/* Dot */}
                            <div className="relative w-6 h-6 rounded-full bg-f1-black border-[3px] border-f1-red shadow-lg shadow-f1-red/60" />
                          </motion.div>
                        </div>

                        {/* Story card */}
                        <div
                          className={`relative lg:flex items-center gap-12 ${
                            isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                          } cursor-pointer group`}
                          onClick={() => handleStoryClick(story)}
                        >
                          {/* Image Section */}
                          <div className={`relative overflow-hidden mb-6 lg:mb-0 lg:w-[48%]`}>
                            <div className="relative aspect-[16/9] bg-f1-carbon">
                              {!isImageLoaded && <ImageShimmer />}
                              <picture>
                                <source
                                  media="(max-width: 1023px)"
                                  srcSet={heroImageMobile}
                                />
                                <img
                                  src={heroImage}
                                  alt={story.title}
                                  className={`w-full h-full object-cover transition-all duration-700 ${
                                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                                  } group-hover:scale-110`}
                                  onLoad={() => handleImageLoad(story.id)}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </picture>
                              {/* Overlay gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-f1-black/90 via-f1-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                              {/* Year badge */}
                              <div className="absolute top-4 left-4">
                                <span className="font-mono text-sm md:text-base text-f1-red uppercase tracking-widest bg-f1-black/90 px-3 py-1.5 border border-f1-red/50">
                                  {story.year}
                                </span>
                              </div>
                              {/* Category badge */}
                              <div className="absolute top-4 right-4">
                                <span className="font-mono text-xs text-white/80 uppercase tracking-widest bg-f1-black/90 px-3 py-1.5 border border-white/20">
                                  {story.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className={`flex-1 lg:w-[48%] ${
                            isEven ? 'lg:pr-16' : 'lg:pl-16'
                          }`}>
                            <motion.div
                              className="relative"
                              whileHover={{ x: isEven ? 8 : -8 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-6 group-hover:text-f1-red transition-colors duration-300 leading-tight">
                                {story.title}
                              </h3>
                              <p className="font-mono text-base md:text-lg text-gray-300 leading-relaxed mb-8 line-clamp-4">
                                {story.subtitle}
                              </p>
                              {/* Read more indicator */}
                              <div className="flex items-center gap-3 text-f1-red opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="font-mono text-xs uppercase tracking-widest">Read Story</span>
                                <motion.div
                                  className="h-[1px] bg-f1-red"
                                  initial={{ width: 0 }}
                                  whileHover={{ width: 48 }}
                                  transition={{ duration: 0.3 }}
                                />
                                <span className="text-f1-red">→</span>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
