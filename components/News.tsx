import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { fetchNews, NewsItem, readNewsCache, IN_CODE_FALLBACK } from '../utils/newsService';
import { imagePreloader } from '../utils/imagePreloader';
import ImageShimmer from './ui/ImageShimmer';

interface NewsProps {
  onClose?: () => void;
}

const News: React.FC<NewsProps> = React.memo(({ onClose }) => {
  const [items, setItems] = useState<NewsItem[]>(IN_CODE_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // Load news data - cache'den hemen göster, arka planda güncelle
  useEffect(() => {
    // STEP 1: Immediately load from cache synchronously (no async delay)
    const loadFromCache = () => {
      try {
        const cachedItems = readNewsCache();
        if (cachedItems && cachedItems.length > 0) {
          // Show cached data immediately - no loading state
          setItems(cachedItems);
          setLoading(false);
          
          // Preload images for first 6 items (above the fold)
          cachedItems.slice(0, 6).forEach((item: NewsItem) => {
            if (item.image && item.image.startsWith('http')) {
              imagePreloader.preloadImage(item.image, { fetchPriority: 'high' });
            }
          });
          
          return true; // Cache found and loaded
        }
      } catch (err) {
        console.warn('Cache read error:', err);
      }
      return false; // No cache found
    };

    // Try to load from cache first
    const cacheLoaded = loadFromCache();
    
    // STEP 2: Fetch fresh data (will use cache if available, or fetch if needed)
    const load = async () => {
      try {
        if (!cacheLoaded) {
          setLoading(true);
        }
        setError(null);
        
        // fetchNews will return cached data immediately if available
        // and trigger background fetch if needed
        const news = await fetchNews();

        if (news.length > 0) {
          setItems(news);
        }
        
        // Preload images for visible items
        news.slice(0, 6).forEach((item: NewsItem) => {
          if (item.image && item.image.startsWith('http')) {
            imagePreloader.preloadImage(item.image, { fetchPriority: 'high' });
          }
        });
      } catch (err) {
        console.error('News load error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Small delay to ensure UI renders cached data first
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (cacheLoaded) {
      // Load fresh data in background after a short delay
      timeoutId = setTimeout(() => {
        load();
        timeoutId = null;
      }, 100);
    } else {
      // No cache - load immediately
      load();
    }
    
    // Set up periodic background refresh (every 5 minutes)
    // This checks if cache was updated by background fetch and refreshes UI
    const refreshInterval = setInterval(() => {
      // Silently refresh from cache - don't show loading state
      // This will pick up any background fetch updates
      fetchNews().then((news) => {
        if (news.length > 0) {
          setItems(news);
        }
      }).catch((err) => {
        console.warn('Background refresh error:', err);
        // Don't show error to user for background refresh
      });
    }, 5 * 60 * 1000); // 5 minutes - check for updates more frequently
    
    return () => {
      clearInterval(refreshInterval);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleRetry = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const news = await fetchNews();
      setItems(news.length > 0 ? news : IN_CODE_FALLBACK);
    } catch {
      setItems(IN_CODE_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageLoad = useCallback((itemId: string) => {
    setImageLoaded(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const handleCardClick = useCallback((item: NewsItem) => {
    if (!item.url || !item.url.startsWith('http')) {
      return;
    }
    
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }, []);

  const truncate = (text: string, n: number = 250): string => {
    if (!text) return '';
    return text.length > n ? `${text.slice(0, n - 1)}…` : text;
  };

  // Sanitize news items for XSS protection
  const sanitizedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      sanitizedTitle: DOMPurify.sanitize(item.title, { ALLOWED_TAGS: [] }),
      sanitizedSummary: DOMPurify.sanitize(truncate(item.summary, 250), { ALLOWED_TAGS: [] }),
    }));
  }, [items]);

  return (
    <div className="relative min-h-screen bg-f1-black text-white py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-6">
            <span className="text-f1-red">F1</span> News
          </h1>
          <p className="font-mono text-sm md:text-base text-gray-400 uppercase tracking-widest">
            Curated from The Race, Autosport & Motorsport.com
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-f1-carbon border border-white/10 rounded-sm overflow-hidden">
                <div className="aspect-[16/9] bg-f1-black/50">
                  <ImageShimmer />
                </div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="font-mono text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="font-mono text-xs uppercase tracking-widest text-f1-red hover:text-white border border-f1-red hover:bg-f1-red px-4 py-2 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* News Grid - Scrollable */}
        {!loading && !error && sanitizedItems.length > 0 && (
          <div className="space-y-8">
            {sanitizedItems.map((item, index) => {
              const isImageLoaded = imageLoaded[item.id] || false;
              
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group cursor-pointer bg-f1-carbon border border-white/10 hover:border-f1-red/50 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-f1-red/20"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Image Section - Takes 1 column on mobile, 1 on desktop */}
                    <div className="relative aspect-[16/9] lg:aspect-auto lg:h-auto bg-f1-black overflow-hidden">
                      {!isImageLoaded && <ImageShimmer />}
                        <img
                          src={item.image || '/favicon.svg'}
                          alt={item.sanitizedTitle}
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            isImageLoaded ? 'opacity-100' : 'opacity-0'
                          } group-hover:scale-110`}
                          onLoad={() => handleImageLoad(item.id)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // If image fails and it's not already placeholder, try to load placeholder
                            if (!target.src.includes('favicon.svg')) {
                              target.src = '/favicon.svg';
                            }
                            handleImageLoad(item.id);
                          }}
                          loading={index < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          fetchPriority={index < 6 ? 'high' : index < 12 ? 'auto' : 'low'}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          width={800}
                          height={450}
                        />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-f1-black/95 via-f1-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />
                      {/* Date badge */}
                      {item.publishedAt && (
                        <div className="absolute top-4 right-4 z-10 pointer-events-none">
                          <span className="font-mono text-xs text-white/80 uppercase tracking-widest bg-f1-black/90 px-3 py-1.5 border border-white/20">
                            {item.publishedAt}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Takes 2 columns on desktop */}
                    <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                      <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-white mb-4 group-hover:text-f1-red transition-colors duration-300 leading-tight">
                        {item.sanitizedTitle}
                      </h3>
                      {item.sanitizedSummary && (
                        <p className="font-mono text-sm md:text-base text-gray-300 leading-relaxed mb-6">
                          {item.sanitizedSummary}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Sources */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                            Sources:
                          </span>
                          {item.sourceName.split(', ').map((source, idx) => {
                            // Highlight the source that provided the image (first one in the list)
                            const isImageSource = idx === 0;
                            return (
                              <span 
                                key={idx}
                                className={`font-mono text-xs uppercase tracking-widest ${
                                  isImageSource ? 'text-f1-red' : 'text-f1-red/60'
                                }`}
                                title={isImageSource ? 'Image source' : ''}
                              >
                                {source}
                                {idx < item.sourceName.split(', ').length - 1 && <span className="text-gray-500 mx-1">•</span>}
                              </span>
                            );
                          })}
                        </div>
                        {/* Read More */}
                        <div className="flex items-center gap-2 text-f1-red opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-mono text-xs uppercase tracking-widest">Read More</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Footer Disclaimer */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-8 border-t border-white/10 text-center"
          >
            <p className="font-mono text-xs text-gray-500 leading-relaxed max-w-3xl mx-auto mb-4">
              Headlines and summaries are synthesized from multiple sources for navigation only. 
              Full content and images are available on the original source sites.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <span className="font-mono uppercase tracking-widest">Sources:</span>
              <a href="https://www.the-race.com" target="_blank" rel="noopener noreferrer" className="hover:text-f1-red transition-colors">
                The Race
              </a>
              <span>•</span>
              <a href="https://www.autosport.com" target="_blank" rel="noopener noreferrer" className="hover:text-f1-red transition-colors">
                Autosport
              </a>
              <span>•</span>
              <a href="https://www.motorsport.com" target="_blank" rel="noopener noreferrer" className="hover:text-f1-red transition-colors">
                Motorsport.com
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

News.displayName = 'News';

export default News;
