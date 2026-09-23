# Hotel Signage Hub CMS

Giao diện quầy lễ tân. Gọi REST của `hotel-signage-hub-backend`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000. API backend (Herd): http://hubback.test/api

Tài khoản local nằm trong `DemoSeeder` của backend. Không hiện trên trang đăng nhập production.

Production: `https://signagehub.online`. Push `main` → runner trên VPS pull và `docker compose up -d --build` trong `deploy/`.
