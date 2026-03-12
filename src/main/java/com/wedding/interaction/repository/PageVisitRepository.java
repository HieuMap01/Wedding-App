package com.wedding.interaction.repository;

import com.wedding.interaction.entity.PageVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    long countByWeddingId(Long weddingId);
}
