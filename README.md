# ExamAI

>Nền tảng quản lý lớp học, điểm danh, bài tập và kiểm tra trực tuyến.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:5173` trong trình duyệt.

Frontend mặc định gọi API tại `http://localhost:4000/api`. Khi deploy, tạo biến môi trường `VITE_API_URL` theo mẫu trong [.env.example](.env.example) và đặt thành URL backend production.

## Chạy backend

Mở terminal thứ hai và chạy:

```bash
npm run server
```

API chạy tại `http://localhost:4000/api`. Danh sách endpoint và ví dụ request nằm trong [server/README.md](server/README.md).

## Kiểm tra production

```bash
npm run build
npm run preview
```

## Deploy online

Project hiện là frontend Vite static, có thể deploy trực tiếp lên Vercel hoặc Netlify.

### Vercel

1. Đẩy repository lên GitHub.
2. Vào Vercel, chọn **Add New Project** và import repository.
3. Vercel sẽ nhận diện Vite tự động. Nếu cần, dùng:
	- Build command: `npm run build`
	- Output directory: `dist`
4. Nhấn **Deploy**.

File `vercel.json` đã cấu hình fallback SPA để các route frontend không bị lỗi 404 khi refresh.

### Netlify

Import repository trên Netlify với:

- Build command: `npm run build`
- Publish directory: `dist`

File `netlify.toml` đã cấu hình redirect về `index.html`.

### Deploy backend

Backend Express có thể deploy riêng trên Render bằng file `render.yaml`:

1. Tạo **New Web Service** trên Render và chọn repository.
2. Render sẽ đọc `render.yaml`, chạy `npm install` và `npm start`.
3. Sau khi deploy, API có dạng `https://ten-service.onrender.com/api`.
4. Frontend cần dùng URL API này thay cho `http://localhost:4000/api` khi kết nối thật.

Lưu ý: `server/data.json` phù hợp cho demo và development. Production nên thay bằng PostgreSQL, Firebase hoặc Supabase vì filesystem của hosting có thể bị reset khi service restart.

## Phạm vi hiện tại

Backend hiện cung cấp API REST và lưu file JSON. Khi Render restart, file JSON có thể bị reset; production nên chuyển sang PostgreSQL, Firebase hoặc Supabase. Backend đã giới hạn CORS bằng biến `ALLOWED_ORIGINS`; nếu đổi domain Vercel, cập nhật biến này trên Render rồi redeploy.
