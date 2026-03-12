package com.wedding.iam.config;

import com.wedding.iam.entity.User;
import com.wedding.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("⚠️ ADMIN_EMAIL not configured. Skipping admin seed.");
            return;
        }
        // Seed Super Admin if not exists
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName("Super Admin")
                    .role(User.Role.SUPER_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Super Admin seeded successfully");
        }
    }
}
