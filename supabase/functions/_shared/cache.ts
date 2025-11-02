// Simple in-memory cache for Edge Functions
// Note: In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}

// Practice cache helpers
export function getPracticeCacheKey(practiceId: string): string {
  return `practice:${practiceId}`;
}

export function getUserPhoneCacheKey(userId: string, phoneId: string): string {
  return `user_phone:${userId}:${phoneId}`;
}
