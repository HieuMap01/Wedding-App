package com.wedding.interaction.client;

import com.wedding.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "wedding-core-service", url = "http://localhost:8080")
public interface CoreClient {

    @GetMapping("/api/weddings/internal/{id}")
    ApiResponse<Map<String, Object>> getWeddingById(@PathVariable("id") Long id);
}
