package com.wedding.core.repository;

import com.wedding.core.entity.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeddingRepository extends JpaRepository<Wedding, Long> {
    Optional<Wedding> findByCoupleUserId(Long coupleUserId);
    Optional<Wedding> findBySlug(String slug);
    boolean existsByCoupleUserId(Long coupleUserId);
    boolean existsBySlug(String slug);
}
