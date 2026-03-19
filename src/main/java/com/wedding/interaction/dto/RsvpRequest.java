package com.wedding.interaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RsvpRequest {
    @NotBlank(message = "Tên khách mời không được để trống")
    private String guestName;

    private String guestPhone;

    private String wishes;

    @NotNull(message = "Lựa chọn tham dự không được để trống")
    private String attendance; // "ATTENDING" or "NOT_ATTENDING"
}
