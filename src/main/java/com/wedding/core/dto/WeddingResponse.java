package com.wedding.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeddingResponse {
    private Long id;
    private Long coupleUserId;
    private String slug;
    private String groomName;
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
    private Boolean isPublished;
    private String groomBankName;
    private String groomBankAccountNumber;
    private String groomBankAccountHolder;
    private String brideBankName;
    private String brideBankAccountNumber;
    private String brideBankAccountHolder;
    private Boolean isActive;
    private String publicUrl;
    private String musicUrl;
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
    private String templateCode;
    private List<WeddingImageResponse> images;
    private List<LoveStoryEventResponse> loveStoryEvents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
