package com.wedding.core.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdateWeddingRequest {
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

    private String groomBankName;
    private String groomBankAccountNumber;
    private String groomBankAccountHolder;
    
    private String brideBankName;
    private String brideBankAccountNumber;
    private String brideBankAccountHolder;
    private String musicUrl;
    private String templateCode;
}
