package com.wedding.interaction.controller;

import com.wedding.common.dto.ApiResponse;
import com.wedding.common.exception.AppException;
import com.wedding.common.exception.ErrorCode;
import com.wedding.interaction.dto.*;
import com.wedding.interaction.service.InteractionService;
import com.wedding.interaction.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wedding.common.dto.PageResponse;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;
    private final RateLimitService rateLimitService;

    // ---- Public endpoints (Guest) ----

    @PostMapping("/{weddingId}/visit")
    public ResponseEntity<ApiResponse<Void>> recordVisit(
            @PathVariable Long weddingId,
            HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");

        interactionService.recordVisit(weddingId, ipAddress, userAgent, referer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Visit recorded", null));
    }

    @PostMapping("/{weddingId}/rsvp")
    public ResponseEntity<ApiResponse<RsvpResponse>> submitRsvp(
            @PathVariable Long weddingId,
            @Valid @RequestBody RsvpRequest rsvpRequest,
            HttpServletRequest request) {
        String ipAddress = getClientIp(request);

        // Rate limiting: max 5 RSVPs per IP per wedding per hour
        if (!rateLimitService.isAllowed(weddingId, ipAddress)) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many RSVP submissions. Please try again later.");
        }

        RsvpResponse response = interactionService.submitRsvp(weddingId, rsvpRequest, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("RSVP submitted successfully", response));
    }

    // ---- Couple endpoints (need weddingId from header or query) ----

    @GetMapping("/mine/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getMyStats(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId) {
        StatsResponse response = interactionService.getStatsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/mine/rsvps")
    public ResponseEntity<ApiResponse<PageResponse<RsvpResponse>>> getMyRsvps(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<RsvpResponse> response = interactionService.getRsvpsForWedding(weddingId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/mine/wishes")
    public ResponseEntity<ApiResponse<PageResponse<WishResponse>>> getMyWishes(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<WishResponse> response = interactionService.getWishesForWedding(weddingId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ---- Admin endpoints ----

    @GetMapping("/admin/{weddingId}/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getAdminStats(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId) {
        validateAdmin(role);
        StatsResponse response = interactionService.getStatsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/{weddingId}/rsvps")
    public ResponseEntity<ApiResponse<PageResponse<RsvpResponse>>> getAdminRsvps(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        validateAdmin(role);
        PageResponse<RsvpResponse> response = interactionService.getRsvpsForWedding(weddingId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/{weddingId}/wishes")
    public ResponseEntity<ApiResponse<PageResponse<WishResponse>>> getAdminWishes(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        validateAdmin(role);
        PageResponse<WishResponse> response = interactionService.getWishesForWedding(weddingId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private void validateAdmin(String role) {
        if (!"SUPER_ADMIN".equals(role)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access denied. Admin role required.");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
