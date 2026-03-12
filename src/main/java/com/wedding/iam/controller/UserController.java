package com.wedding.iam.controller;

import com.wedding.common.dto.ApiResponse;
import com.wedding.iam.dto.UpdateUserRequest;
import com.wedding.iam.dto.UserResponse;
import com.wedding.iam.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/iam/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestHeader("X-User-Id") Long userId) {
        UserResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UpdateUserRequest request) {
        UserResponse response = authService.updateCurrentUser(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", response));
    }
}
