package com.wedding.core.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.wedding.common.exception.AppException;
import com.wedding.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    public String storeFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Could not store file to Cloudinary: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            // Extract public ID from URL
            // Example: https://res.cloudinary.com/demo/image/upload/v1234/public_id.jpg
            String publicId = extractPublicId(fileUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (IOException e) {
            // Log failure
        }
    }

    private String extractPublicId(String url) {
        if (url == null || !url.contains("/")) return null;
        String filename = url.substring(url.lastIndexOf("/") + 1);
        return filename.split("\\.")[0];
    }
}
