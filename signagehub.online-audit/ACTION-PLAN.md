# Action plan — signagehub.online

| Ưu tiên | Việc cần làm | Vì sao | Cách kiểm chứng |
|---|---|---|---|
| P1 | Sửa xử lý not-found để URL không khớp route trả 404 thay vì 500. | Production trả 500 cho URL random và `/.well-known/*`. | GET URL ngẫu nhiên ở cả `/` và `/vi/`; kiểm tra HTTP 404, HTML lỗi có H1 phù hợp; kiểm tra log để không còn exception. |
| P1 | Bảo vệ server-side các route CMS; chọn 401/403 hoặc redirect login cho anonymous, và chiến lược index rõ ràng. | Các route bị robots chặn vẫn trả 200 generic shell, thiếu meta robots. | Kiểm tra GET ẩn danh không trả nội dung CMS; xác nhận code/status; URL Inspection/robots tester cho từng route. |
| P1 | Xác nhận source commit/build production và đồng bộ sitemap, title, metadata, schema offers. | Live markup differs from current workspace; source changes are uncommitted. | So sánh release SHA; tải production HTML/XML sau deploy; đảm bảo metadata và Offer schema khớp các trang EN/VI. |
| P2 | Chuyển alias locale cố định từ 307 sang 308/301 và cập nhật internal links. | 307 báo chuyển tạm dù alias là URL cũ/không chuẩn. | `curl -I` với `/vi/gallery`, `/vi/pricing`; một hop tới canonical localized path; kiểm tra links và canonical. |
| P2 | Đo PSI/CrUX và đánh giá cache cho public pages. | `private,no-store` có thể tăng TTFB; CWV chưa đo. | PSI PHONE/DESKTOP và CrUX 28 ngày cho home/pricing; đo TTFB qua CDN/origin; chỉ điều chỉnh sau khi kiểm tra cookie/cache safety. |
| P3 | Bỏ hreflang cho login noindex nếu trang này không dành cho index. | Hreflang đang trỏ đến trang noindex. | Kiểm tra response `/login` và `/vi/dang-nhap`; đảm bảo không còn alternates nếu quyết định bỏ. |
| P3 | Kiểm tra security headers ở Cloudflare/origin. | Các header được kiểm tra chưa có trên response HTML. | Security header scan sau khi cấu hình; xác nhận HTTPS và các subdomain trước HSTS preload. |
| P3 | Chỉ bổ sung llms/AI discovery nếu có mục tiêu agent-specific. | Hiện đây là thiếu hụt tùy chọn, không phải Google index blocker. | Nếu triển khai, kiểm tra HTTP 200, nội dung đúng, crawler policy và Lighthouse Agentic Browsing. |
