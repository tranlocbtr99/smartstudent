# ExamAI API

API demo dùng Express và lưu dữ liệu trong `data.json`.

## Chạy

```bash
npm run server
```

Base URL: `http://localhost:4000/api`

Để dùng AI tạo đề, đặt biến môi trường `GEMINI_API_KEY` trên Render hoặc terminal backend local. Không đặt key này ở Vercel/frontend.

## Endpoint chính

- `GET /health`
- `GET, POST /classes`
- `GET /classes/:classId`
- `GET, POST /classes/:classId/students`
- `GET /classes/:classId/attendance`
- `POST /classes/:classId/attendance/sessions`
- `PATCH /attendance/:recordId`
- `GET, POST /classes/:classId/assignments`
- `GET /notifications`
- `POST /ai/generate-exam-from-file` (multipart Word/PDF)
- `POST /exams`
- `GET /exams/:examId`
- `POST /exams/:examId/attempts`
- `POST /ai/generate-exam`
