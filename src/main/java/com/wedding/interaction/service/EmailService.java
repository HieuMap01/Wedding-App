package com.wedding.interaction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service("interactionEmailService")
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendRsvpNotification(String coupleEmail, String guestName, String attendance, String wishes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(coupleEmail);
            message.setSubject("Có phản hồi RSVP mới từ " + guestName);

            String text = "Xin chào,\n\n" +
                    "Bạn vừa nhận được một phản hồi RSVP mới cho đám cưới của mình:\n\n" +
                    "- Khách mời: " + guestName + "\n" +
                    "- Tình trạng tham dự: " + attendance + "\n" +
                    "- Lời chúc: " + (wishes != null && !wishes.isEmpty() ? wishes : "(Không có)") + "\n\n" +
                    "Vui lòng đăng nhập vào Dashboard để xem chi tiết.\n\n" +
                    "Trân trọng,\nĐội ngũ Wedding SaaS";

            message.setText(text);
            emailSender.send(message);
            log.info("RSVP notification email sent to: {}", coupleEmail);
        } catch (Exception e) {
            log.error("Failed to send RSVP notification email to {}: {}", coupleEmail, e.getMessage());
        }
    }
}
