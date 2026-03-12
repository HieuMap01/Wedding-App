package com.wedding.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateWeddingRequest {
    @NotBlank(message = "Groom name is required")
    private String groomName;

    @NotBlank(message = "Bride name is required")
    private String brideName;

    private String loveStory;
    private String primaryColor;
    private String secondaryColor;
    private LocalDateTime weddingDate;
    private String venueName;
    private String venueAddress;
    private BigDecimal venueLat;
    private BigDecimal venueLng;
    private String groomHouseName;
    private String groomHouseAddress;
    private String brideHouseName;
    private String brideHouseAddress;
    private BigDecimal groomHouseLat;
    private BigDecimal groomHouseLng;
    private BigDecimal brideHouseLat;
    private BigDecimal brideHouseLng;
    private String slug; // optional, auto-generated if empty
}
