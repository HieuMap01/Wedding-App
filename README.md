# Wedding App Monolith

Một ứng dụng quản lý đám cưới và tạo thiệp mời online chuyên nghiệp, được xây dựng theo kiến trúc Monolith để tối ưu tài nguyên và dễ dàng triển khai.

## ✨ Tính năng nổi bật

- **Tạo thiệp cưới online**: Tùy chỉnh thông tin cô dâu, chú rể, câu chuyện tình yêu, thời gian và địa điểm.
- **Quản lý khách mời & RSVP**: Khách mời có thể xác nhận tham dự và để lại lời chúc trực tiếp trên thiệp.
- **Thống kê Dashboard**: Theo dõi số lượng khách tham dự, lượt truy cập và lời chúc theo thời gian thực.
- **Tích hợp Ngân hàng & VietQR**: 
  - Chọn ngân hàng từ danh sách chính thức.
  - Tự động tra cứu tên chủ tài khoản (yêu cầu API Key).
  - Tự động tạo mã QR chuyển khoản chuyên nghiệp.
- **Giao diện hiện đại**: Sử dụng Next.js, kiến trúc linh hoạt với các mục tùy chỉnh dễ dàng.
- **Triển khai Online**: Hỗ trợ chạy online qua Ngrok thông qua cổng chào Nginx gateway.

## 🛠 Công nghệ sử dụng

- **Backend**: Java Spring Boot, Hibernate, MySQL, Redis.
- **Frontend**: Next.js, React, Tailwind CSS.
- **Infrastructure**: Docker, Docker Compose, Nginx (Gateway).
- **External API**: VietQR (Casso).

## 🚀 Hướng dẫn cài đặt nhanh

### 1. Yêu cầu hệ thống
- Docker & Docker Compose
- Ngrok (nếu muốn chạy online)

### 2. Cấu hình môi trường
Tạo file `.env` ở thư mục gốc với các thông tin sau:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MYSQL_ROOT_PASSWORD=your-db-password
JWT_SECRET=your-very-secure-secret
PUBLIC_URL=https://your-ngrok-domain.ngrok-free.dev (nếu chạy online)
```

### 3. Khởi chạy với Docker
```bash
docker-compose up -d --build
```
Ứng dụng sẽ khả dụng tại:
- **Nginx Gateway**: [http://localhost:81](http://localhost:81)
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)

## 🌐 Triển khai Online qua Ngrok

1. Cài đặt ngrok và xác thực authtoken.
2. Chạy lệnh: `ngrok http 81 --domain=YOUR_DOMAIN`
3. Cập nhật `PUBLIC_URL` trong `.env`.
4. Build lại frontend: `docker-compose up -d --build wedding-frontend`

## 📝 License
Dự án được phát triển bởi [Bùi Minh Hiếu](https://github.com/HieuMap01).
