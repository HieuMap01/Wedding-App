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
public class WishResponse {
    private Long id;
    private String guestName;
    private String wishes;
    private LocalDateTime createdAt;
}
