package com.wedding.interaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RsvpRequest {
    @NotBlank(message = "Guest name is required")
    private String guestName;

    private String guestPhone;

    private String wishes;

    @NotNull(message = "Attendance is required")
    private String attendance; // "ATTENDING" or "NOT_ATTENDING"
}
