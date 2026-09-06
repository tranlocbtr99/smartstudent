# ExamAI API

API demo dùng Express và lưu dữ liệu trong `data.json`.

## Chạy

```bash
npm run server
```

Base URL: `http://localhost:4000/api`

Để dùng AI chuyển đề, đặt `GEMINI_API_KEY` và `GEMINI_MODEL=gemini-3.6-flash` trên Render hoặc terminal backend local. Không đặt key này ở Vercel/frontend.

Tài khoản demo sau khi seed dữ liệu: `admin@examai.vn / Admin@123`, `teacher@examai.vn / Teacher@123`, `student@examai.vn / Student@123`. Hãy đổi mật khẩu và `JWT_SECRET` trước khi dùng production.

## Endpoint chính

- `POST /auth/login`
- `GET /auth/me`
- `GET, POST /admin/users` (admin only)
- `GET /health`
- `GET, POST /classes`
- `GET /classes/:classId`
- `GET, POST /classes/:classId/students`
- `GET /classes/:classId/attendance`
- `POST /classes/:classId/attendance/sessions`
- `PATCH /attendance/:recordId`
- `GET, POST /classes/:classId/assignments`
- `GET /notifications`
- `POST /ai/generate-exam-from-file` (multipart Word/PDF, chuyển đổi đề có sẵn)
- `POST /ai/convert-exam-text` (chuyển đổi nội dung đề nhập thủ công)
- `POST /exams`
- `GET /exams/:examId` (học sinh chỉ thấy đề đã publish)
- `POST /exams/:examId/attempts`
- `POST /classes/:classId/exams/:examId/publish` (teacher/admin)

Các endpoint cần đăng nhập nhận header `Authorization: Bearer <token>`.
- `POST /ai/generate-exam`
