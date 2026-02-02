import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { imagePreloader } from '../utils/imagePreloader';
import ImageShimmer from './ui/ImageShimmer';

interface GalleryProps {
  onClose?: () => void;
}

interface GalleryImage {
  id: number;
  mobilePath: string;
  desktopPath: string;
}

const Gallery: React.FC<GalleryProps> = React.memo(({ onClose }) => {
  const [selectedLayout, setSelectedLayout] = useState<'full' | 'portrait'>('full');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Generate image paths for 1-40 (includes Jaguar Monaco 38–40)
  const generateImages = (layout: 'full' | 'portrait'): GalleryImage[] => {
    const folderPaths = {
      full: 'Full 1280x720',
      portrait: 'Portrait 1280x1707',
    };

    const images: GalleryImage[] = [];
    for (let i = 1; i <= 40; i++) {
      const folder = folderPaths[layout];
      images.push({
        id: i,
        mobilePath: `/images/${folder}/${i}.png`,
        desktopPath: `/images/${folder}/${i}.png`,
      });
    }
    return images;
  };

  const images = useMemo(() => generateImages(selectedLayout), [selectedLayout]);

  // Preload first 3 images + new story images (23–27, 38–40) when layout changes
  useEffect(() => {
    const firstThree = images.slice(0, 3);
    const newStoryImages = images.filter(img => (img.id >= 23 && img.id <= 27) || (img.id >= 38 && img.id <= 40));
    const imagesToPreload = [...firstThree, ...newStoryImages];
    
    imagesToPreload.forEach((img) => {
      const imagePath = isMobile ? img.mobilePath : img.desktopPath;
      imagePreloader.preloadImage(imagePath, {
        fetchPriority: img.id <= 3 || (img.id >= 23 && img.id <= 27) || (img.id >= 38 && img.id <= 40) ? 'high' : 'low'
      });
    });
  }, [images, isMobile]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoaded(prev => ({ ...prev, [imageId]: true }));
  };

  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  }, [selectedImage, images]);

  const handlePrevImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  }, [selectedImage, images]);


  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, handleNextImage, handlePrevImage]);

  const aspectRatio = selectedLayout === 'portrait' ? '3/4' : '16/9';

  return (
    <div className="relative min-h-screen bg-f1-black text-white py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Visual Gallery</h1>
          <p className="font-mono text-sm md:text-base text-gray-400 uppercase tracking-widest mb-8">
            Cinematic archive of Formula 1 history
          </p>

          {/* Layout Filters */}
          <div className="flex gap-4 mb-8">
            {(['full', 'portrait'] as const).map((layout) => (
              <button
                key={layout}
                onClick={() => {
                  setSelectedLayout(layout);
                  setSelectedImage(null);
                  setImageLoaded({});
                }}
                className={`font-mono text-sm uppercase tracking-widest px-6 py-3 border-2 transition-all duration-300 ${
                  selectedLayout === layout
                    ? 'border-f1-red text-f1-red bg-f1-red/10'
                    : 'border-white/20 text-gray-400 hover:border-white/40 hover:text-white'
                }`}
              >
                {layout.charAt(0).toUpperCase() + layout.slice(1)}
              </button>
            ))}
          </div>

          <p className="font-mono text-xs text-gray-500">
            {images.length} image{images.length !== 1 ? 's' : ''} • {selectedLayout} layout
          </p>
        </motion.div>

        {/* Image Grid – framed, original aspect, design-aligned */}
        <div
          className={
            selectedLayout === 'full'
              ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 md:gap-8 space-y-6 md:space-y-8'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'
          }
        >
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => {
              const imageId = `${selectedLayout}-${image.id}`;
              const loaded = imageLoaded[imageId] || false;
              const imagePath = isMobile ? image.mobilePath : image.desktopPath;
              const isPriority = image.id <= 3 || (image.id >= 23 && image.id <= 27) || (image.id >= 38 && image.id <= 40);

              return (
                <motion.div
                  key={imageId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.02 }}
                  className={`group cursor-pointer relative ${selectedLayout === 'full' ? 'break-inside-avoid' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  {/* Frame: thin border, padding, design-aligned */}
                  <div
                    className="relative bg-f1-black/80 border border-white/15 hover:border-f1-red/40 transition-colors duration-300 p-[6px] md:p-2"
                    style={{
                      aspectRatio: selectedLayout === 'portrait' ? '3/4' : '16/9',
                    }}
                  >
                    <div className="absolute inset-[6px] md:inset-2 border border-white/10 group-hover:border-white/20 transition-colors duration-300 pointer-events-none" />
                    {!loaded && (
                      <ImageShimmer
                        aspectRatio={selectedLayout === 'portrait' ? '3/4' : '16/9'}
                        className="absolute inset-[6px] md:inset-2"
                      />
                    )}
                    <img
                      src={imagePath}
                      alt={`Gallery image ${image.id}`}
                      className={`absolute inset-[6px] md:inset-2 w-[calc(100%-12px)] md:w-[calc(100%-16px)] h-[calc(100%-12px)] md:h-[calc(100%-16px)] object-contain transition-all duration-500 ${
                        loaded ? 'opacity-100' : 'opacity-0'
                      } group-hover:opacity-95`}
                      onLoad={() => handleImageLoad(imageId)}
                      loading={isPriority ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={isPriority ? 'high' : 'auto'}
                      width={selectedLayout === 'portrait' ? 1280 : 1280}
                      height={selectedLayout === 'portrait' ? 1707 : 720}
                    />
                    <div className="absolute bottom-[10px] left-[10px] right-[10px] md:bottom-3 md:left-3 md:right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="font-mono text-[10px] md:text-xs text-f1-red uppercase tracking-widest">
                        {image.id}/40
                      </span>
                      <span className="font-mono text-[9px] md:text-[10px] text-white/60 uppercase tracking-widest">
                        {selectedLayout}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/98 z-[100] backdrop-blur-sm"
              onClick={handleCloseLightbox}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none"
              onClick={handleCloseLightbox}
            >
              <div
                className="max-w-7xl w-full h-full flex flex-col pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={handleCloseLightbox}
                  className="self-end font-mono text-sm uppercase tracking-widest text-white hover:text-f1-red transition-colors bg-black/50 px-4 py-2 mb-4 border border-white/20 hover:border-f1-red"
                >
                  ESC
                </button>

                {/* Image container */}
                <div className="relative flex-1 flex items-center justify-center bg-f1-black/50 border border-white/10">
                  {/* Previous button */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 md:left-8 z-10 font-mono text-xs uppercase tracking-widest text-white hover:text-f1-red transition-colors bg-black/50 px-4 py-2 border border-white/20 hover:border-f1-red"
                  >
                    ←
                  </button>

                  {/* Image */}
                  <div
                    className="relative w-full h-full flex items-center justify-center p-4"
                    style={{ aspectRatio }}
                  >
                    <img
                      src={isMobile ? selectedImage.mobilePath : selectedImage.desktopPath}
                      alt={`Gallery image ${selectedImage.id}`}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      width={selectedLayout === 'portrait' ? 1280 : 1280}
                      height={selectedLayout === 'portrait' ? 1707 : 720}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 md:right-8 z-10 font-mono text-xs uppercase tracking-widest text-white hover:text-f1-red transition-colors bg-black/50 px-4 py-2 border border-white/20 hover:border-f1-red"
                  >
                    →
                  </button>
                </div>

                {/* Image info */}
                <div className="mt-4 flex items-center justify-between text-white">
                  <div className="font-mono text-sm uppercase tracking-widest">
                    <span className="text-f1-red">{selectedImage.id}</span>
                    <span className="text-gray-400"> / 40</span>
                  </div>
                  <div className="font-mono text-xs uppercase tracking-widest text-gray-400">
                    {selectedLayout} • {isMobile ? 'mobile' : 'desktop'}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

Gallery.displayName = 'Gallery';

export default Gallery;
