package com.wedding.iam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Token làm mới không được để trống")
    private String refreshToken;
}
