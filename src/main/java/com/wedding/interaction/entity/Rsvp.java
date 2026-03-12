package com.wedding.interaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rsvps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wedding_id", nullable = false)
    private Long weddingId;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "guest_phone", length = 20)
    private String guestPhone;

    @Column(columnDefinition = "TEXT")
    private String wishes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Attendance attendance;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Attendance {
        ATTENDING, NOT_ATTENDING
    }
}
