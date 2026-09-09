# Hotel Signage Hub CMS

Giao diện quầy lễ tân. Gọi REST của `hotel-signage-hub-backend`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000. API backend (Herd): http://hubback.test/api

Tài khoản demo (sau `php artisan migrate --seed` ở backend):

- `desk@saigon-pearl.test` / `password` (lễ tân)
- `manager@saigon-pearl.test` / `password` (quản lý — nhân viên + thêm phòng)
- `admin@hub.test` / `password` (thêm khách sạn, tạo quản lý)
