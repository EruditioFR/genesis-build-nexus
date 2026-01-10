import { supabase } from '@/integrations/supabase/client';

interface CachedUrl {
  url: string;
  expiresAt: number;
}

const CACHE_KEY = 'signed_urls_cache';
const URL_EXPIRY_MS = 50 * 60 * 1000; // 50 minutes (URLs are valid for 1h, we refresh 10min early)

/**
 * Get the cache from localStorage
 */
const getCache = (): Record<string, CachedUrl> => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    return JSON.parse(cached);
  } catch {
    return {};
  }
};

/**
 * Save the cache to localStorage
 */
const setCache = (cache: Record<string, CachedUrl>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage might be full, clear old entries
    clearExpiredUrls();
  }
};

/**
 * Clear expired URLs from cache
 */
export const clearExpiredUrls = () => {
  const cache = getCache();
  const now = Date.now();
  const cleanedCache: Record<string, CachedUrl> = {};
  
  for (const [key, value] of Object.entries(cache)) {
    if (value.expiresAt > now) {
      cleanedCache[key] = value;
    }
  }
  
  localStorage.setItem(CACHE_KEY, JSON.stringify(cleanedCache));
};

/**
 * Get a cached signed URL if it exists and is not expired
 */
export const getCachedSignedUrl = (bucket: string, filePath: string): string | null => {
  const cache = getCache();
  const cacheKey = `${bucket}:${filePath}`;
  const cached = cache[cacheKey];
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  
  return null;
};

/**
 * Store a signed URL in the cache
 */
export const setCachedSignedUrl = (bucket: string, filePath: string, url: string) => {
  const cache = getCache();
  const cacheKey = `${bucket}:${filePath}`;
  
  cache[cacheKey] = {
    url,
    expiresAt: Date.now() + URL_EXPIRY_MS,
  };
  
  setCache(cache);
};

/**
 * Generate a signed URL with caching
 */
export const getSignedUrl = async (
  bucket: string,
  filePath: string,
  expirySeconds = 3600
): Promise<string | null> => {
  // Normalize path - remove bucket prefix if present
  let normalizedPath = filePath;
  if (normalizedPath.startsWith(`${bucket}/`)) {
    normalizedPath = normalizedPath.replace(`${bucket}/`, '');
  }
  
  // Check cache first
  const cached = getCachedSignedUrl(bucket, normalizedPath);
  if (cached) {
    return cached;
  }
  
  // Generate new signed URL
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(normalizedPath, expirySeconds);
    
    if (error) {
      console.error('Error creating signed URL:', error, 'for path:', normalizedPath);
      return null;
    }
    
    if (data?.signedUrl) {
      setCachedSignedUrl(bucket, normalizedPath, data.signedUrl);
      return data.signedUrl;
    }
    
    return null;
  } catch (err) {
    console.error('Failed to create signed URL:', err);
    return null;
  }
};

/**
 * Generate signed URLs for multiple files with caching
 */
export const getSignedUrls = async (
  bucket: string,
  filePaths: string[],
  expirySeconds = 3600
): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  const pathsToFetch: string[] = [];
  
  // Check cache for each path
  for (const filePath of filePaths) {
    let normalizedPath = filePath;
    if (normalizedPath.startsWith(`${bucket}/`)) {
      normalizedPath = normalizedPath.replace(`${bucket}/`, '');
    }
    
    const cached = getCachedSignedUrl(bucket, normalizedPath);
    if (cached) {
      results[filePath] = cached;
    } else {
      pathsToFetch.push(filePath);
    }
  }
  
  // Fetch uncached URLs in parallel
  if (pathsToFetch.length > 0) {
    const fetchPromises = pathsToFetch.map(async (filePath) => {
      const url = await getSignedUrl(bucket, filePath, expirySeconds);
      if (url) {
        results[filePath] = url;
      }
    });
    
    await Promise.all(fetchPromises);
  }
  
  return results;
};

/**
 * Clear all cached signed URLs
 */
export const clearSignedUrlCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
