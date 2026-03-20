package com.wedding.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // General Errors
    INTERNAL_SERVER_ERROR("ERR_500", "Đã xảy ra lỗi hệ thống"),
    BAD_REQUEST("ERR_400", "Yêu cầu không hợp lệ hoặc không được hỗ trợ"),
    VALIDATION_ERROR("ERR_400_VAL", "Dữ liệu không hợp lệ"),
    UNAUTHORIZED("ERR_401", "Yêu cầu đăng nhập"),
    FORBIDDEN("ERR_403", "Bạn không có quyền thực hiện hành động này"),
    RESOURCE_NOT_FOUND("ERR_404", "Không tìm thấy dữ liệu yêu cầu"),

    // IAM Errors (Prefix: IAM_)
    USER_NOT_FOUND("IAM_001", "Người dùng không tồn tại"),
    USER_ALREADY_EXISTS("IAM_002", "Email này đã được sử dụng"),
    INVALID_CREDENTIALS("IAM_003", "Email hoặc mật khẩu không chính xác"),
    INVALID_TOKEN("IAM_004", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),
    TOKEN_EXPIRED("IAM_005", "Mã xác thực đã hết hạn"),

    // Wedding Core Errors (Prefix: WED_)
    WEDDING_NOT_FOUND("WED_001", "Không tìm thấy thông tin đám cưới"),
    WEDDING_ALREADY_EXISTS("WED_002", "Bạn đã tạo thiệp cưới rồi"),
    WEDDING_NOT_PUBLISHED("WED_003", "Thiệp cưới này chưa được xuất bản"),
    INVALID_WEDDING_SLUG("WED_004", "Đường dẫn (slug) không hợp lệ hoặc đã tồn tại"),
    WEDDING_LOCKED("WED_005", "Tài khoản thiệp cưới này đã bị khóa bởi quản trị viên"),

    // Interaction Errors (Prefix: INT_)
    RATE_LIMIT_EXCEEDED("INT_001", "Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
