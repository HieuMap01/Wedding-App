package com.wedding.core.service;

import com.wedding.core.dto.WeddingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeddingCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "wedding:slug:";
    private static final long CACHE_TTL_MINUTES = 1440; // Cache for 24 hours since it changes rarely

    /**
     * Get cached wedding by slug
     */
    public WeddingResponse getCachedWedding(String slug) {
        try {
            Object cached = redisTemplate.opsForValue().get(CACHE_PREFIX + slug);
            if (cached instanceof WeddingResponse) {
                log.debug("Cache HIT for slug: {}", slug);
                return (WeddingResponse) cached;
            }
        } catch (Exception e) {
            log.warn("Redis cache read failed for slug: {}, error: {}", slug, e.getMessage());
        }
        return null;
    }

    /**
     * Cache a wedding response by slug
     */
    public void cacheWedding(String slug, WeddingResponse response) {
        try {
            redisTemplate.opsForValue().set(CACHE_PREFIX + slug, response, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
            log.debug("Cached wedding for slug: {}", slug);
        } catch (Exception e) {
            log.warn("Redis cache write failed for slug: {}, error: {}", slug, e.getMessage());
        }
    }

    /**
     * Invalidate cache for a specific slug
     */
    public void evictCache(String slug) {
        try {
            redisTemplate.delete(CACHE_PREFIX + slug);
            log.debug("Evicted cache for slug: {}", slug);
        } catch (Exception e) {
            log.warn("Redis cache evict failed for slug: {}, error: {}", slug, e.getMessage());
        }
    }
}
