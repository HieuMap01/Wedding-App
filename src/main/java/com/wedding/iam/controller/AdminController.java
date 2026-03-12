package com.wedding.iam.controller;

import com.wedding.common.dto.ApiResponse;
import com.wedding.common.exception.UnauthorizedException;
import com.wedding.iam.dto.UserResponse;
import com.wedding.iam.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wedding.common.dto.PageResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/iam/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllCouples(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        validateAdmin(role);
        PageResponse<UserResponse> response = authService.getAllCouples(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id) {
        if (role != null) {
            validateAdmin(role);
        }
        UserResponse response = authService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestHeader("X-User-Role") String role) {
        validateAdmin(role);
        Map<String, Object> stats = authService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id,
            @RequestParam boolean isActive) {
        validateAdmin(role);
        authService.updateUserStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private void validateAdmin(String role) {
        if (!"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
    }
}
