package com.wedding.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoveStoryEventResponse {
    private Long id;
    private String title;
    private String eventDate;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
