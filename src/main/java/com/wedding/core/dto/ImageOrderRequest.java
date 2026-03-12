package com.wedding.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImageOrderRequest {
    private List<ImageOrderItem> imageOrders;

    @Data
    public static class ImageOrderItem {
        private Long imageId;
        private Integer displayOrder;
    }
}
