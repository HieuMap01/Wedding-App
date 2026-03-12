package com.wedding.iam.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service("iamEmailService")
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Chào mừng đến với hệ thống tạo thiệp cưới Wedding SaaS");
            message.setText("Xin chào " + fullName + ",\n\n" +
                    "Cảm ơn bạn đã đăng ký tài khoản trên nền tảng Wedding SaaS của chúng tôi. " +
                    "Chúng tôi rất vui được đồng hành cùng bạn trong ngày trọng đại!\n\n" +
                    "Hãy đăng nhập và bắt đầu tạo trang thiệp cưới của riêng bạn nhé.\n\n" +
                    "Trân trọng,\nĐội ngũ Wedding SaaS");

            emailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }
}
