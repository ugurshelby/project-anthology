import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["-0.06em", "0.15em"]);
  
  return (
    <div 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-f1-black border-b border-white/5"
      style={{ position: 'relative' }}
    >
      
      <motion.div 
        style={{ y, opacity }} 
        className="absolute inset-0 z-0 will-change-transform"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.06)_0%,transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.04)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-f1-black" />
        <motion.div 
          className="absolute -left-1/3 top-1/4 w-[160%] h-32 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl contrast-200 will-change-transform"
          animate={{ x: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 mix-blend-multiply" />
      </motion.div>

      {/* Center Stage */}
      <div className="relative z-20 text-center w-full">
        <motion.div style={{ opacity }} className="will-change-opacity">
          
          {/* Pre-Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center items-center gap-4 mb-8"
          >
             <div className="h-[1px] w-12 bg-f1-red" />
             <span className="font-mono text-xs text-gray-300 uppercase tracking-[0.4em]">The Formula 1 Narrative</span>
             <div className="h-[1px] w-12 bg-f1-red" />
          </motion.div>

          <motion.h1 
            ref={titleRef}
            style={{ letterSpacing }}
            className="font-serif text-[12vw] md:text-[14vw] font-black text-white uppercase leading-[0.85] tracking-tighter cursor-default select-none"
          >
            Anthology
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="font-serif font-light text-lg md:text-2xl text-gray-300 mt-10 tracking-wide max-w-xl mx-auto leading-[1.6]"
          >
            Beyond the checkered flag.
          </motion.p>
        </motion.div>
      </div>

      {/* Telemetry / Footer Interface */}
      <div className="absolute bottom-0 left-0 right-0 w-full px-4 md:px-8 py-6 z-30 border-t border-white/5">
        <div className="relative w-full flex items-end">
          {/* Left Data */}
          <div className="hidden md:flex font-mono text-[9px] text-f1-red/80 space-y-1 flex-shrink-0">
            <div>
              <p>LAT: 43.7347° N</p>
              <p>LNG: 7.4206° E</p>
              <p>FOUNDER: ugurshelby</p>
            </div>
          </div>

          {/* Scroll Indicator - Always centered using flex-1 and justify-center */}
          <div className="flex-1 flex justify-center items-end">
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500 whitespace-nowrap">Scroll to Initialize</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-f1-red to-transparent" />
            </motion.div>
          </div>

          {/* Right Data */}
          <div className="hidden md:flex font-mono text-[9px] text-right text-gray-500 space-y-1 flex-shrink-0">
            <div>
              <p>VER: 2.4.0_RC</p>
              <p>All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
