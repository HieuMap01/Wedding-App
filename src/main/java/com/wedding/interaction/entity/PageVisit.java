package com.wedding.interaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_visits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wedding_id", nullable = false)
    private Long weddingId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    private String referer;

    @CreationTimestamp
    @Column(name = "visited_at", updatable = false)
    private LocalDateTime visitedAt;
}
