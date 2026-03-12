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
public class WeddingImageResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
