package com.wedding.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateWeddingRequest {
    @NotBlank(message = "Tên chú rể không được để trống")
    private String groomName;

    @NotBlank(message = "Tên cô dâu không được để trống")
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
    private String templateCode;
    private String groomImageUrl;
    private String brideImageUrl;
    private String groomFatherName;
    private String groomMotherName;
    private String brideFatherName;
    private String brideMotherName;
    private String groomPosition;
    private String bridePosition;
    private String groomQrCodeUrl;
    private String brideQrCodeUrl;
}
