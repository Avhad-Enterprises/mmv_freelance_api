/**
 * Generic in-memory cache utility
 * In production, replace with Redis or similar distributed cache
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class Cache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

    /**
     * Get value from cache
     */
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }
        
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data as T;
    }

    /**
     * Set value in cache
     */
    public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Delete specific key from cache
     */
    public delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all keys matching a pattern
     */
    public deletePattern(pattern: string): void {
        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        });
    }

    /**
     * Clear all cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    public cleanup(): void {
        const now = Date.now();
        const keys = Array.from(this.cache.keys());
        
        keys.forEach(key => {
            const entry = this.cache.get(key);
            if (entry && now > entry.expiresAt) {
                this.cache.delete(key);
            }
        });
    }

    /**
     * Get cache size
     */
    public size(): number {
        return this.cache.size;
    }
}

// Singleton instance
export const cache = new Cache();

// Run cleanup every 10 minutes
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);
