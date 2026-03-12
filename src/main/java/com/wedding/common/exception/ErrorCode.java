package com.wedding.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // General Errors
    INTERNAL_SERVER_ERROR("ERR_500", "Internal server error occurred"),
    BAD_REQUEST("ERR_400", "Bad request syntax or unsupported method"),
    VALIDATION_ERROR("ERR_400_VAL", "Validation failed"),
    UNAUTHORIZED("ERR_401", "Unauthorized access"),
    FORBIDDEN("ERR_403", "Access denied"),
    RESOURCE_NOT_FOUND("ERR_404", "Requested resource not found"),

    // IAM Errors (Prefix: IAM_)
    USER_NOT_FOUND("IAM_001", "User not found"),
    USER_ALREADY_EXISTS("IAM_002", "User already exists with this email"),
    INVALID_CREDENTIALS("IAM_003", "Invalid email or password"),
    INVALID_TOKEN("IAM_004", "Invalid or expired token"),

    // Wedding Core Errors (Prefix: WED_)
    WEDDING_NOT_FOUND("WED_001", "Wedding not found"),
    WEDDING_ALREADY_EXISTS("WED_002", "Wedding already exists for this couple"),
    WEDDING_NOT_PUBLISHED("WED_003", "This wedding is not yet published"),
    INVALID_WEDDING_SLUG("WED_004", "Wedding slug is invalid or already taken"),
    WEDDING_LOCKED("WED_005", "This wedding account has been locked by administrator"),

    // Interaction Errors (Prefix: INT_)
    RATE_LIMIT_EXCEEDED("INT_001", "Too many requests. Please try again later");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
