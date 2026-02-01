#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 * 
 * Checks bundle sizes after build and warns if they exceed thresholds.
 * Can be used in CI/CD pipelines to prevent bundle size regressions.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  'react-vendor': 150, // React + ReactDOM + React Router
  'framer-vendor': 100, // Framer Motion
  'vendor': 200, // Other vendor libraries
  'main': 100, // Main app bundle
  'story-modal': 50, // Story modal chunk
  'gallery': 50, // Gallery chunk
  'timeline': 50, // Timeline chunk
  'news': 50, // News chunk
};

// Gzip compression ratio estimate (typical for JS)
const GZIP_RATIO = 0.3;

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size / 1024; // Convert to KB
  } catch (error) {
    return 0;
  }
}

/**
 * Get gzipped size estimate
 */
function getGzippedSize(filePath) {
  const size = getFileSize(filePath);
  return size * GZIP_RATIO;
}

/**
 * Find all JS files in assets directory
 */
function findJSFiles(dir) {
  const files = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findJSFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

/**
 * Extract chunk name from file path
 */
function getChunkName(filePath) {
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
  // Remove hash and extension: chunk-name-[hash].js -> chunk-name
  const match = fileName.match(/^(.+?)-[a-f0-9]+\.js$/);
  return match ? match[1] : 'unknown';
}

/**
 * Format size for display
 */
function formatSize(kb) {
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Main function
 */
function main() {
  console.log('📦 Bundle Size Check\n');
  
  if (!statSync(DIST_DIR, { throwIfNoEntry: false })) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const jsFiles = findJSFiles(ASSETS_DIR);
  
  if (jsFiles.length === 0) {
    console.error('❌ No JS files found in dist/assets/');
    process.exit(1);
  }
  
  const chunks = new Map();
  let totalSize = 0;
  let totalGzippedSize = 0;
  
  // Group files by chunk name
  for (const file of jsFiles) {
    const chunkName = getChunkName(file);
    const size = getFileSize(file);
    const gzippedSize = getGzippedSize(file);
    
    if (!chunks.has(chunkName)) {
      chunks.set(chunkName, { size: 0, gzippedSize: 0, files: [] });
    }
    
    const chunk = chunks.get(chunkName);
    chunk.size += size;
    chunk.gzippedSize += gzippedSize;
    chunk.files.push(file);
    totalSize += size;
    totalGzippedSize += gzippedSize;
  }
  
  // Sort chunks by size (descending)
  const sortedChunks = Array.from(chunks.entries())
    .sort((a, b) => b[1].size - a[1].size);
  
  // Display results
  console.log('Chunk Sizes:\n');
  
  let hasWarnings = false;
  
  for (const [chunkName, data] of sortedChunks) {
    const threshold = THRESHOLDS[chunkName] || Infinity;
    const exceedsThreshold = data.size > threshold;
    
    if (exceedsThreshold) {
      hasWarnings = true;
      console.log(`⚠️  ${chunkName.padEnd(20)} ${formatSize(data.size).padStart(10)} (gzipped: ${formatSize(data.gzippedSize).padStart(10)}) - EXCEEDS THRESHOLD (${formatSize(threshold)})`);
    } else {
      console.log(`✅ ${chunkName.padEnd(20)} ${formatSize(data.size).padStart(10)} (gzipped: ${formatSize(data.gzippedSize).padStart(10)})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${formatSize(totalSize)} (gzipped: ~${formatSize(totalGzippedSize)})`);
  console.log('='.repeat(60) + '\n');
  
  // Check CSS files
  const cssFiles = findJSFiles(ASSETS_DIR).filter(f => f.endsWith('.css'));
  if (cssFiles.length > 0) {
    let cssTotal = 0;
    for (const file of cssFiles) {
      cssTotal += getFileSize(file);
    }
    console.log(`CSS: ${formatSize(cssTotal)} (gzipped: ~${formatSize(cssTotal * GZIP_RATIO)})\n`);
  }
  
  if (hasWarnings) {
    console.log('⚠️  Some chunks exceed their size thresholds.');
    console.log('Consider optimizing these chunks or adjusting thresholds.\n');
    process.exit(1);
  } else {
    console.log('✅ All chunks are within their size thresholds.\n');
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
