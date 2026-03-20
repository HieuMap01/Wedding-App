package com.wedding.core.controller;

import com.wedding.common.dto.ApiResponse;
import com.wedding.core.dto.*;
import com.wedding.core.service.WeddingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/weddings")
@RequiredArgsConstructor
public class WeddingController {

    private final WeddingService weddingService;

    // ---- Couple endpoints ----

    @PostMapping
    public ResponseEntity<ApiResponse<WeddingResponse>> createWedding(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateWeddingRequest request) {
        WeddingResponse response = weddingService.createWedding(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Wedding created successfully", response));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<WeddingResponse>> getMyWedding(
            @RequestHeader("X-User-Id") Long userId) {
        WeddingResponse response = weddingService.getMyWedding(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/mine")
    public ResponseEntity<ApiResponse<WeddingResponse>> updateMyWedding(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UpdateWeddingRequest request) {
        WeddingResponse response = weddingService.updateMyWedding(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Wedding updated", response));
    }

    @PutMapping("/mine/publish")
    public ResponseEntity<ApiResponse<WeddingResponse>> publishWedding(
            @RequestHeader("X-User-Id") Long userId) {
        WeddingResponse response = weddingService.publishWedding(userId);
        return ResponseEntity.ok(ApiResponse.ok("Wedding published! Share your link.", response));
    }

    @PostMapping("/mine/images")
    public ResponseEntity<ApiResponse<WeddingImageResponse>> uploadImage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {
        WeddingImageResponse response = weddingService.uploadImage(userId, file, caption);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded", response));
    }

    @DeleteMapping("/mine/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long imageId) {
        weddingService.deleteImage(userId, imageId);
        return ResponseEntity.ok(ApiResponse.ok("Image deleted", null));
    }

    @PutMapping("/mine/images/order")
    public ResponseEntity<ApiResponse<List<WeddingImageResponse>>> updateImageOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ImageOrderRequest request) {
        List<WeddingImageResponse> response = weddingService.updateImageOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Image order updated", response));
    }

    @GetMapping("/mine/qr")
    public ResponseEntity<ApiResponse<String>> getMyQrCode(
            @RequestHeader("X-User-Id") Long userId) {
        String qrCodeBase64 = weddingService.generateQrCode(userId);
        return ResponseEntity.ok(ApiResponse.ok("QR Code generated successfully", qrCodeBase64));
    }

    // ---- Timeline endpoints ----

    @PostMapping("/mine/timeline")
    public ResponseEntity<ApiResponse<LoveStoryEventResponse>> addTimelineEvent(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "eventDate", required = false) String eventDate,
            @RequestParam(value = "description", required = false) String description) {
        LoveStoryEventResponse response = weddingService.addTimelineEvent(userId, file, title, eventDate, description);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Mốc thời gian đã được thêm", response));
    }

    @PutMapping("/mine/timeline/{eventId}")
    public ResponseEntity<ApiResponse<LoveStoryEventResponse>> updateTimelineEvent(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long eventId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "eventDate", required = false) String eventDate,
            @RequestParam(value = "description", required = false) String description) {
        LoveStoryEventResponse response = weddingService.updateTimelineEvent(userId, eventId, file, title, eventDate, description);
        return ResponseEntity.ok(ApiResponse.ok("Mốc thời gian đã được cập nhật", response));
    }

    @DeleteMapping("/mine/timeline/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deleteTimelineEvent(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long eventId) {
        weddingService.deleteTimelineEvent(userId, eventId);
        return ResponseEntity.ok(ApiResponse.ok("Mốc thời gian đã được xóa", null));
    }

    // ---- Public endpoint ----

    @GetMapping("/public/{slug}")
    public ResponseEntity<ApiResponse<WeddingResponse>> getPublicWedding(@PathVariable String slug) {
        WeddingResponse response = weddingService.getPublicWedding(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ---- Admin endpoints ----

    @GetMapping("/admin/list")
    public ResponseEntity<ApiResponse<List<WeddingResponse>>> getAllWeddings(
            @RequestHeader("X-User-Role") String role) {
        validateAdmin(role);
        List<WeddingResponse> response = weddingService.getAllWeddings();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/{weddingId}")
    public ResponseEntity<ApiResponse<WeddingResponse>> getWeddingById(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId) {
        validateAdmin(role);
        WeddingResponse response = weddingService.getWeddingById(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/admin/{weddingId}/status")
    public ResponseEntity<ApiResponse<WeddingResponse>> toggleWeddingStatus(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId,
            @RequestParam boolean isActive) {
        validateAdmin(role);
        WeddingResponse response = weddingService.toggleWeddingStatus(weddingId, isActive);
        return ResponseEntity.ok(ApiResponse.ok("Wedding status updated", response));
    }

    private void validateAdmin(String role) {
        if (!"SUPER_ADMIN".equals(role)) {
            throw new com.wedding.common.exception.AppException(com.wedding.common.exception.ErrorCode.FORBIDDEN,
                    "Access denied. Admin role required.");
        }
    }
}
