# ExamAI API

API demo dùng Express và lưu dữ liệu trong `data.json`.

## Chạy

```bash
npm run server
```

Base URL: `http://localhost:4000/api`

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
