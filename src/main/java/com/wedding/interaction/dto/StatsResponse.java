package com.wedding.interaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private Long weddingId;
    private long totalVisits;
    private long totalRsvps;
    private long attendingCount;
    private long notAttendingCount;
}
