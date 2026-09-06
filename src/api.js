const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Không thể kết nối máy chủ.')
  return payload.data
}

export const api = {
  getClasses: () => request('/classes'),
  createClass: (body) => request('/classes', { method: 'POST', body: JSON.stringify(body) }),
  getStudents: (classId) => request(`/classes/${classId}/students`),
  getClass: (classId) => request(`/classes/${classId}`),
  addStudent: (classId, body) => request(`/classes/${classId}/students`, { method: 'POST', body: JSON.stringify(body) }),
  getAttendance: (classId) => request(`/classes/${classId}/attendance`),
  createAttendanceSession: (classId, body = {}) => request(`/classes/${classId}/attendance/sessions`, { method: 'POST', body: JSON.stringify(body) }),
  updateAttendance: (recordId, status) => request(`/attendance/${recordId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAssignments: (classId) => request(`/classes/${classId}/assignments`),
  createAssignment: (classId, body) => request(`/classes/${classId}/assignments`, { method: 'POST', body: JSON.stringify(body) }),
  getNotifications: () => request('/notifications'),
  generateExam: (body) => request('/ai/generate-exam', { method: 'POST', body: JSON.stringify(body) }),
  generateExamFromFile: (formData) => request('/ai/generate-exam-from-file', { method: 'POST', headers: {}, body: formData }),
  convertExamText: (body) => request('/ai/convert-exam-text', { method: 'POST', body: JSON.stringify(body) }),
  saveExam: (body) => request('/exams', { method: 'POST', body: JSON.stringify(body) }),
  getExam: (examId) => request(`/exams/${examId}`),
  getExams: () => request('/exams'),
  submitAttempt: (examId, body) => request(`/exams/${examId}/attempts`, { method: 'POST', body: JSON.stringify(body) }),
}
