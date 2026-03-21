package com.wedding.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "weddings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "couple_user_id", unique = true, nullable = false)
    private Long coupleUserId;

    @Column(unique = true)
    private String slug;

    @Column(name = "groom_name")
    private String groomName;

    @Column(name = "bride_name")
    private String brideName;

    @Column(name = "love_story", columnDefinition = "TEXT")
    private String loveStory;

    @Column(name = "primary_color", length = 10)
    private String primaryColor;

    @Column(name = "secondary_color", length = 10)
    private String secondaryColor;

    @Column(name = "wedding_date")
    private LocalDateTime weddingDate;

    @Column(name = "venue_name")
    private String venueName;

    @Column(name = "venue_address")
    private String venueAddress;

    @Column(name = "venue_lat", precision = 10, scale = 7)
    private BigDecimal venueLat;

    @Column(name = "venue_lng", precision = 10, scale = 7)
    private BigDecimal venueLng;

    @Column(name = "groom_house_name")
    private String groomHouseName;

    @Column(name = "groom_house_address")
    private String groomHouseAddress;

    @Column(name = "bride_house_name")
    private String brideHouseName;

    @Column(name = "bride_house_address")
    private String brideHouseAddress;

    @Column(name = "groom_house_lat", precision = 10, scale = 7)
    private BigDecimal groomHouseLat;

    @Column(name = "groom_house_lng", precision = 10, scale = 7)
    private BigDecimal groomHouseLng;

    @Column(name = "bride_house_lat", precision = 10, scale = 7)
    private BigDecimal brideHouseLat;

    @Column(name = "bride_house_lng", precision = 10, scale = 7)
    private BigDecimal brideHouseLng;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "groom_bank_name")
    private String groomBankName;

    @Column(name = "groom_bank_account_number")
    private String groomBankAccountNumber;

    @Column(name = "groom_bank_account_holder")
    private String groomBankAccountHolder;

    @Column(name = "bride_bank_name")
    private String brideBankName;

    @Column(name = "bride_bank_account_number")
    private String brideBankAccountNumber;

    @Column(name = "bride_bank_account_holder")
    private String brideBankAccountHolder;

    @Column(name = "music_url")
    private String musicUrl;

    @Column(name = "groom_image_url")
    private String groomImageUrl;

    @Column(name = "bride_image_url")
    private String brideImageUrl;

    @Column(name = "groom_father_name")
    private String groomFatherName;

    @Column(name = "groom_mother_name")
    private String groomMotherName;

    @Column(name = "bride_father_name")
    private String brideFatherName;

    @Column(name = "bride_mother_name")
    private String brideMotherName;

    @Column(name = "template_code", length = 50)
    @Builder.Default
    private String templateCode = "template1";

    @Column(name = "groom_position")
    private String groomPosition;

    @Column(name = "bride_position")
    private String bridePosition;

    @Column(name = "groom_qr_code_url")
    private String groomQrCodeUrl;

    @Column(name = "bride_qr_code_url")
    private String brideQrCodeUrl;

    @Column(name = "groom_house_note", columnDefinition = "TEXT")
    private String groomHouseNote;

    @Column(name = "bride_house_note", columnDefinition = "TEXT")
    private String brideHouseNote;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "wedding", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<WeddingImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "wedding", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<LoveStoryEvent> loveStoryEvents = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
