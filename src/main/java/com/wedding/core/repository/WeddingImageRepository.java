package com.wedding.core.repository;

import com.wedding.core.entity.WeddingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeddingImageRepository extends JpaRepository<WeddingImage, Long> {
    List<WeddingImage> findByWeddingIdOrderByDisplayOrderAsc(Long weddingId);
    void deleteByIdAndWeddingId(Long id, Long weddingId);
}
