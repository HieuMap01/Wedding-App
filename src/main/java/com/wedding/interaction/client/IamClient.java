package com.wedding.interaction.client;

import com.wedding.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "iam-service", url = "http://localhost:8080")
public interface IamClient {

    @GetMapping("/api/iam/admin/users/{id}")
    ApiResponse<Map<String, Object>> getUserInfo(@PathVariable("id") Long id);
}
