# 💍 Wedding App Monolith - Nền tảng Tạo Thiệp Cưới Online

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.1-brightgreen?style=flat-square&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=flat-square&logo=docker)](https://www.docker.com/)

Một giải pháp toàn diện để tạo và quản lý thiệp mời đám cưới trực tuyến chuyên nghiệp. Được xây dựng trên kiến trúc Monolith tối ưu, giúp bạn dễ dàng triển khai chỉ với vài bước đơn giản.

---

## ✨ Tính Năng Nổi Bật

### 🎨 Thiết Kế & Giao Diện
- **Đa dạng mẫu thiệp**: Hỗ trợ nhiều phong cách (Hiện đại, Truyền thống Á Đông) với khả năng tùy biến cao.
- **Tùy chỉnh linh hoạt**: Cập nhật thông tin Cô dâu & Chú rể, Album ảnh cưới, Câu chuyện tình yêu, và Lịch trình buổi lễ.
- **Âm nhạc & Hiệu ứng**: Tích hợp trình phát nhạc tự động và hiệu ứng hình ảnh (tim bay, overlay chào mừng) chuyên nghiệp.

### 👥 Quản Lý Khách Mời (RSVP)
- **Xác nhận tham dự**: Khách mời có thể gửi thông tin xác nhận tham dự và lời chúc ngay trên web.
- **Bảng điều khiển (Dashboard)**: Theo dõi danh sách khách mời, thống kê số lượng tham dự và quản lý lời chúc theo thời gian thực.
- **Mã QR & Link**: Tự động tạo mã QR và đường dẫn (Slug) tùy chỉnh để dễ dàng chia sẻ qua mạng xã hội.

### 🧧 Tài Chính & Quyên Góp
- **Tích hợp VietQR**: Tự động tạo mã QR chuyển khoản ngân hàng chuyên nghiệp.
- **Tra cứu tài khoản**: Tự động hiển thị tên chủ tài khoản khi nhập số tài khoản (tích hợp API VietQR/Casso).

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.x, Hibernate/JPA, MySQL |
| **Frontend** | Next.js 14, React, Tailwind CSS, Framer Motion |
| **Caching** | Redis (cho Session & Rate limiting) |
| **DevOps** | Docker, Docker Compose, Nginx Gateway |
| **API Ngoài** | VietQR/Casso, Cloudinary (Lưu trữ ảnh), Google Maps |

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu Cầu Hệ Thống
- Docker & Docker Compose
- Node.js & NPM (cho phát triển frontend cục bộ)
- JDK 17 (cho phát triển backend cục bộ)

### 2. Cấu Hình Môi Trường
Tạo file `.env` tại thư mục gốc của dự án:
```env
# Database & Mail
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MYSQL_ROOT_PASSWORD=your-db-password

# Security
JWT_SECRET=your-very-secrect-key

# Deployment
PUBLIC_URL=https://your-domain.com
```

### 3. Khởi Chạy Bằng Docker
```bash
docker-compose up -d --build
```
Dự án sẽ khả dụng tại:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Nginx Gateway**: [http://localhost:81](http://localhost:81)

---

## 🌐 Triển Khai Online Qua Ngrok

Để chia sẻ thiệp của bạn lên internet ngay lập tức:

1. Chạy ngrok qua cổng gateway:
   ```bash
   ngrok http 81 --domain=your-domain.ngrok-free.dev
   ```
2. Cập nhật `PUBLIC_URL` trong file `.env` thành URL ngrok của bạn.
3. Build lại frontend để nhận cấu hình URL mới:
   ```bash
   docker-compose up -d --build wedding-frontend
   ```

---

## 📝 License & Tác Giả

Dự án được thực hiện bởi **Bùi Minh Hiếu**.
- GitHub: [@HieuMap01](https://github.com/HieuMap01)
- Email: [minhhieu12092003@gmail.com](mailto:minhhieu12092003@gmail.com)

---
*Chúc bạn có một ngày trọng đại thật trọn vẹn và hạnh phúc!* ❤️
