package com.wedding.interaction.repository;

import com.wedding.interaction.entity.Rsvp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface RsvpRepository extends JpaRepository<Rsvp, Long> {
    Page<Rsvp> findByWeddingIdOrderByCreatedAtDesc(Long weddingId, Pageable pageable);

    @Query("SELECT r FROM Rsvp r WHERE r.weddingId = :weddingId AND r.wishes IS NOT NULL AND TRIM(r.wishes) <> '' ORDER BY r.createdAt DESC")
    Page<Rsvp> findWishesByWeddingId(@Param("weddingId") Long weddingId, Pageable pageable);

    long countByWeddingId(Long weddingId);

    long countByWeddingIdAndAttendance(Long weddingId, Rsvp.Attendance attendance);
}
