package com.wedding.interaction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String RATE_LIMIT_PREFIX = "ratelimit:rsvp:";
    private static final int MAX_RSVP_PER_HOUR = 5;
    private static final long WINDOW_HOURS = 1;

    /**
     * Check if IP is allowed to submit RSVP for this wedding
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(Long weddingId, String ipAddress) {
        String key = RATE_LIMIT_PREFIX + weddingId + ":" + ipAddress;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                // First request - set expiry
                redisTemplate.expire(key, WINDOW_HOURS, TimeUnit.HOURS);
            }
            boolean allowed = count != null && count <= MAX_RSVP_PER_HOUR;
            if (!allowed) {
                log.warn("Rate limit exceeded for wedding {} from IP {}", weddingId, ipAddress);
            }
            return allowed;
        } catch (Exception e) {
            log.warn("Redis rate limit check failed, allowing request: {}", e.getMessage());
            return true; // Graceful degradation - allow if Redis is down
        }
    }
}
