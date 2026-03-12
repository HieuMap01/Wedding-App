package com.wedding.interaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RsvpResponse {
    private Long id;
    private String guestName;
    private String guestPhone;
    private String wishes;
    private String attendance;
    private LocalDateTime createdAt;
}
