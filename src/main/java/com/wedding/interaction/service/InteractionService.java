package com.wedding.interaction.service;

import com.wedding.common.exception.AppException;
import com.wedding.common.exception.ErrorCode;
import com.wedding.interaction.dto.*;
import com.wedding.interaction.entity.PageVisit;
import com.wedding.interaction.entity.Rsvp;
import com.wedding.interaction.repository.PageVisitRepository;
import com.wedding.interaction.repository.RsvpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding.core.service.WeddingService;
import com.wedding.iam.service.AuthService;
import com.wedding.core.dto.WeddingResponse;
import com.wedding.iam.dto.UserResponse;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.wedding.common.dto.PageResponse;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final RsvpRepository rsvpRepository;
    private final PageVisitRepository pageVisitRepository;
    private final EmailService emailService;
    private final AuthService authService;
    private final WeddingService weddingService;

    // ---- Public endpoints (Guest) ----

    @Async
    @Transactional
    public void recordVisit(Long weddingId, String ipAddress, String userAgent, String referer) {
        PageVisit visit = PageVisit.builder()
                .weddingId(weddingId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .referer(referer)
                .build();
        pageVisitRepository.save(visit);
    }

    @Transactional
    public RsvpResponse submitRsvp(Long weddingId, RsvpRequest request, String ipAddress) {
        Rsvp.Attendance attendance;
        try {
            attendance = Rsvp.Attendance.valueOf(request.getAttendance().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Invalid attendance value. Use 'ATTENDING' or 'NOT_ATTENDING'");
        }

        Rsvp rsvp = Rsvp.builder()
                .weddingId(weddingId)
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
                .wishes(request.getWishes())
                .attendance(attendance)
                .ipAddress(ipAddress)
                .build();

        rsvp = rsvpRepository.save(rsvp);

        // Notify couple asynchronously (Best effort)
        try {
            WeddingResponse wedding = weddingService.getWeddingById(weddingId);
            if (wedding != null && wedding.getCoupleUserId() != null) {
                UserResponse couple = authService.getUserById(wedding.getCoupleUserId());
                if (couple != null && couple.getEmail() != null) {
                    emailService.sendRsvpNotification(couple.getEmail(), request.getGuestName(), attendance.name(),
                            request.getWishes());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger RSVP email: " + e.getMessage());
        }

        return toRsvpResponse(rsvp);
    }

    // ---- Couple endpoints ----

    public StatsResponse getStatsForWedding(Long weddingId) {
        return StatsResponse.builder()
                .weddingId(weddingId)
                .totalVisits(pageVisitRepository.countByWeddingId(weddingId))
                .totalRsvps(rsvpRepository.countByWeddingId(weddingId))
                .attendingCount(rsvpRepository.countByWeddingIdAndAttendance(weddingId, Rsvp.Attendance.ATTENDING))
                .notAttendingCount(
                        rsvpRepository.countByWeddingIdAndAttendance(weddingId, Rsvp.Attendance.NOT_ATTENDING))
                .build();
    }

    public PageResponse<RsvpResponse> getRsvpsForWedding(Long weddingId, int page, int size) {
        Page<Rsvp> rsvpPage = rsvpRepository.findByWeddingIdOrderByCreatedAtDesc(weddingId, PageRequest.of(page, size));
        List<RsvpResponse> content = rsvpPage.getContent().stream()
                .map(this::toRsvpResponse)
                .collect(Collectors.toList());

        return PageResponse.<RsvpResponse>builder()
                .content(content)
                .pageNo(rsvpPage.getNumber())
                .pageSize(rsvpPage.getSize())
                .totalElements(rsvpPage.getTotalElements())
                .totalPages(rsvpPage.getTotalPages())
                .last(rsvpPage.isLast())
                .build();
    }

    public PageResponse<WishResponse> getWishesForWedding(Long weddingId, int page, int size) {
        Page<Rsvp> rsvpPage = rsvpRepository.findWishesByWeddingId(weddingId, PageRequest.of(page, size));
        List<WishResponse> content = rsvpPage.getContent().stream()
                .map(r -> WishResponse.builder()
                        .id(r.getId())
                        .guestName(r.getGuestName())
                        .wishes(r.getWishes())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<WishResponse>builder()
                .content(content)
                .pageNo(rsvpPage.getNumber())
                .pageSize(rsvpPage.getSize())
                .totalElements(rsvpPage.getTotalElements())
                .totalPages(rsvpPage.getTotalPages())
                .last(rsvpPage.isLast())
                .build();
    }

    private RsvpResponse toRsvpResponse(Rsvp rsvp) {
        return RsvpResponse.builder()
                .id(rsvp.getId())
                .guestName(rsvp.getGuestName())
                .guestPhone(rsvp.getGuestPhone())
                .wishes(rsvp.getWishes())
                .attendance(rsvp.getAttendance().name())
                .createdAt(rsvp.getCreatedAt())
                .build();
    }
}
