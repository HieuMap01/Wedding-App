package com.wedding.core.repository;

import com.wedding.core.entity.LoveStoryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoveStoryEventRepository extends JpaRepository<LoveStoryEvent, Long> {
    List<LoveStoryEvent> findByWeddingIdOrderByDisplayOrderAsc(Long weddingId);
}
