import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, 'data.json')
const app = express()
const port = Number(process.env.PORT || 4000)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(null, false)
  },
}))
app.use(express.json())

function readData() {
  return JSON.parse(readFileSync(dataPath, 'utf8'))
}

function writeData(data) {
  writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`)
}

function findClass(data, classId) {
  return data.classes.find((item) => item.id === classId || item.code === classId)
}

function requireClass(req, res) {
  const data = readData()
  const classItem = findClass(data, req.params.classId)
  if (!classItem) {
    res.status(404).json({ error: 'Không tìm thấy lớp học.' })
    return null
  }
  return { data, classItem }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'exam-ai-api', timestamp: new Date().toISOString() })
})

app.get('/api/classes', (_req, res) => {
  const data = readData()
  const classes = data.classes.map((classItem) => ({
    ...classItem,
    studentCount: data.students.filter((student) => student.classId === classItem.id).length,
    assignmentCount: data.assignments.filter((assignment) => assignment.classId === classItem.id).length,
    sessionCount: data.attendanceSessions.filter((session) => session.classId === classItem.id).length,
  }))
  res.json({ data: classes })
})

app.post('/api/classes', (req, res) => {
  const { code, name, subject = '', room = '', schedule = '', teacherId = 'teacher-demo' } = req.body
  if (!code || !name) return res.status(400).json({ error: 'code và name là bắt buộc.' })
  const data = readData()
  if (data.classes.some((item) => item.code.toLowerCase() === code.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Mã lớp đã tồn tại.' })
  }
  const classItem = { id: `class-${randomUUID()}`, code: code.trim().toUpperCase(), name: name.trim(), subject, room, schedule, teacherId, createdAt: new Date().toISOString() }
  data.classes.push(classItem)
  writeData(data)
  res.status(201).json({ data: classItem })
})

app.get('/api/classes/:classId', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  const { data, classItem } = result
  res.json({ data: { ...classItem, studentCount: data.students.filter((student) => student.classId === classItem.id).length, assignmentCount: data.assignments.filter((assignment) => assignment.classId === classItem.id).length, sessionCount: data.attendanceSessions.filter((session) => session.classId === classItem.id).length } })
})

app.get('/api/classes/:classId/students', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  res.json({ data: result.data.students.filter((student) => student.classId === result.classItem.id) })
})

app.post('/api/classes/:classId/students', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  const { name, email = '' } = req.body
  if (!name) return res.status(400).json({ error: 'name là bắt buộc.' })
  const studentId = req.body.id?.trim().toUpperCase() || `HS${String(result.data.students.length + 1).padStart(5, '0')}`
  if (result.data.students.some((student) => student.id === studentId)) return res.status(409).json({ error: 'Mã học sinh đã tồn tại.' })
  const student = { id: studentId, name: name.trim(), email, classId: result.classItem.id, status: 'present', score: null }
  result.data.students.push(student)
  writeData(result.data)
  res.status(201).json({ data: student })
})

app.get('/api/classes/:classId/attendance', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  const sessions = result.data.attendanceSessions.filter((session) => session.classId === result.classItem.id)
  const records = result.data.attendanceRecords.filter((record) => sessions.some((session) => session.id === record.sessionId))
  res.json({ data: { sessions, records } })
})

app.post('/api/classes/:classId/attendance/sessions', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  const expiresInMinutes = Math.max(1, Number(req.body.expiresInMinutes || 2))
  const now = new Date()
  const session = { id: `attendance-${randomUUID()}`, classId: result.classItem.id, code: String(Math.floor(100000 + Math.random() * 900000)), startsAt: now.toISOString(), expiresAt: new Date(now.getTime() + expiresInMinutes * 60000).toISOString(), status: 'active' }
  result.data.attendanceSessions.push(session)
  result.data.students.filter((student) => student.classId === result.classItem.id).forEach((student) => result.data.attendanceRecords.push({ id: `record-${randomUUID()}`, sessionId: session.id, studentId: student.id, status: 'absent', checkedAt: null }))
  writeData(result.data)
  res.status(201).json({ data: session })
})

app.patch('/api/attendance/:recordId', (req, res) => {
  const data = readData()
  const record = data.attendanceRecords.find((item) => item.id === req.params.recordId)
  if (!record) return res.status(404).json({ error: 'Không tìm thấy bản ghi điểm danh.' })
  if (!['present', 'late', 'absent', 'excused'].includes(req.body.status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ.' })
  record.status = req.body.status
  record.checkedAt = new Date().toISOString()
  writeData(data)
  res.json({ data: record })
})

app.get('/api/classes/:classId/assignments', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  res.json({ data: result.data.assignments.filter((assignment) => assignment.classId === result.classItem.id) })
})

app.post('/api/classes/:classId/assignments', (req, res) => {
  const result = requireClass(req, res)
  if (!result) return
  const { title, type = 'exam', dueAt } = req.body
  if (!title || !dueAt) return res.status(400).json({ error: 'title và dueAt là bắt buộc.' })
  const assignment = { id: `assignment-${randomUUID()}`, classId: result.classItem.id, title: title.trim(), type, dueAt, status: 'published', submitted: 0, total: result.data.students.filter((student) => student.classId === result.classItem.id).length }
  result.data.assignments.push(assignment)
  result.data.notifications.push({ id: `notification-${randomUUID()}`, recipientType: 'class', classId: result.classItem.id, type: 'assignment', title: 'Bài tập mới', message: `${assignment.title} đã được giao.`, isRead: false, createdAt: new Date().toISOString() })
  writeData(result.data)
  res.status(201).json({ data: assignment })
})

app.get('/api/notifications', (_req, res) => {
  const data = readData()
  res.json({ data: data.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) })
})

app.use((_req, res) => res.status(404).json({ error: 'API route không tồn tại.' }))
app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Lỗi máy chủ.' })
})

if (!existsSync(dataPath)) writeData({ classes: [], students: [], attendanceSessions: [], attendanceRecords: [], assignments: [], notifications: [] })
app.listen(port, () => console.log(`ExamAI API đang chạy tại http://localhost:${port}`))
