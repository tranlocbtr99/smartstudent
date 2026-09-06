import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Bell, BookOpen, CalendarDays, Check, ChevronDown, ClipboardCheck,
  Clock3, GraduationCap, LayoutDashboard, Menu, Plus, QrCode, Search, Settings,
  Users, X, Zap,
} from 'lucide-react'
import QRCode from 'qrcode'
import './styles.css'
import { api } from './api'

const initialClasses = []
const students = []

const statusLabels = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng', excused: 'Có phép' }
const tabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'students', label: 'Học sinh' },
  { id: 'attendance', label: 'Điểm danh' },
  { id: 'assignments', label: 'Bài tập' },
]

function App() {
  const [classes, setClasses] = useState(initialClasses)
  const [selectedCode, setSelectedCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showClassModal, setShowClassModal] = useState(false)
  const [showNotice, setShowNotice] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const selectedClass = classes.find((item) => item.code === selectedCode) ?? classes[0]

  useEffect(() => {
    api.getClasses()
      .then((items) => {
        setClasses(items.map((item, index) => ({ ...item, students: item.studentCount, sessions: item.sessionCount, accent: ['sage', 'peach', 'blue'][index % 3], active: index === 0 })))
        if (items[0]) setSelectedCode(items[0].code)
      })
      .catch((error) => setApiError(error.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => setNotifications([]))
  }, [])

  if (loading && !selectedClass) return <div className="boot-state">Đang tải dữ liệu từ máy chủ...</div>
  if (!selectedClass) return <div className="boot-state error-state">{apiError || 'Chưa có lớp học nào trong hệ thống.'}<button className="primary-button" onClick={() => setShowClassModal(true)}><Plus size={17} /> Tạo lớp học</button></div>

  function createClass(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = form.get('name')?.trim()
    const code = form.get('code')?.trim().toUpperCase()
    if (!name || !code) return
    api.createClass({ code, name, subject: form.get('subject')?.trim(), room: form.get('room')?.trim(), schedule: form.get('schedule')?.trim() })
      .then((created) => {
        setClasses((current) => [...current, { ...created, students: 0, sessions: 0, accent: 'blue', active: false }])
        setSelectedCode(created.code)
        setActiveTab('overview')
        setShowClassModal(false)
      })
      .catch((error) => setApiError(error.message))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><GraduationCap size={20} /></span><span>Exam<span>AI</span></span></div>
        <div className="workspace-label">KHÔNG GIAN LÀM VIỆC</div>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <NavItem icon={<LayoutDashboard size={18} />} label="Tổng quan" onClick={() => setActiveTab('overview')} active={activeTab === 'overview'} />
          <NavItem icon={<Users size={18} />} label="Lớp học" onClick={() => setActiveTab('overview')} active={activeTab === 'overview'} />
          <NavItem icon={<BookOpen size={18} />} label="Đề thi" onClick={() => setActiveTab('assignments')} active={activeTab === 'assignments'} />
          <NavItem icon={<ClipboardCheck size={18} />} label="Bài tập" onClick={() => setActiveTab('assignments')} active={activeTab === 'assignments'} />
          <NavItem icon={<CalendarDays size={18} />} label="Điểm danh" onClick={() => setActiveTab('attendance')} active={activeTab === 'attendance'} />
          <NavItem icon={<GraduationCap size={18} />} label="Học sinh" onClick={() => setActiveTab('students')} active={activeTab === 'students'} />
          <NavItem icon={<Zap size={18} />} label="Kết quả" onClick={() => setActiveTab('overview')} active={false} />
          <NavItem icon={<Bell size={18} />} label="Thông báo" onClick={() => setShowNotice(true)} active={showNotice} />
          <NavItem icon={<Zap size={18} />} label="AI tạo đề" />
        </nav>
        <div className="sidebar-bottom">
          <NavItem icon={<Settings size={18} />} label="Cài đặt" />
          <div className="profile-card"><div className="avatar avatar-dark">NA</div><div><strong>Nguyễn Văn A</strong><small>Giáo viên</small></div><ChevronDown size={15} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Mở menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Không gian giảng dạy</span><span>/</span><strong>Lớp học</strong></div>
          <div className="top-actions"><div className="search-box"><Search size={17} /><input aria-label="Tìm kiếm lớp học" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm kiếm lớp..." /></div><button className="icon-button notification-button" aria-label="Thông báo" onClick={() => setShowNotice(!showNotice)}><Bell size={19} />{notifications.length > 0 && <i>{notifications.length}</i>}</button><div className="avatar avatar-small">NA</div></div>
          {showNotice && <div className="notification-popover"><strong>Thông báo mới</strong>{notifications.length ? notifications.slice(0, 4).map((notification) => <p key={notification.id}>{notification.message}</p>) : <p>Chưa có thông báo mới.</p>}</div>}
        </header>

        <div className="content-wrap">
          {apiError && <div className="api-alert">API chưa kết nối: {apiError}. Hãy kiểm tra backend production.</div>}
          {loading && <div className="loading-bar" aria-label="Đang tải dữ liệu" />}
          <section className="page-heading"><div><p className="eyebrow">THỨ HAI, 06 THÁNG 09, 2026</p><h1>Lớp học</h1><p className="muted">Theo dõi lớp, điểm danh và giao bài tập trong một nơi.</p></div><button className="primary-button" onClick={() => setShowClassModal(true)}><Plus size={18} /> Tạo lớp học</button></section>

          <section className="class-strip" aria-label="Danh sách lớp học">
            <div className="class-strip-title"><span className="section-kicker">LỚP CỦA TÔI</span><button className="round-add" aria-label="Tạo lớp học" onClick={() => setShowClassModal(true)}><Plus size={16} /></button></div>
            <div className="class-cards">{classes.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => <button key={item.code} className={`class-card ${item.code === selectedCode ? 'selected' : ''}`} onClick={() => { setSelectedCode(item.code); setActiveTab('overview') }}><span className={`class-dot ${item.accent}`} /><span className="class-info"><strong>{item.code}</strong><small>{item.name}</small></span><span className="class-count">{item.students} <small>HS</small></span></button>)}{!classes.some((item) => `${item.code} ${item.name}`.toLowerCase().includes(searchTerm.toLowerCase())) && <p className="interaction-hint">Không tìm thấy lớp phù hợp.</p>}</div>
          </section>

          <section className="class-header"><div><div className="title-line"><h2>{selectedClass.code}</h2><span className="live-badge"><span /> Đang hoạt động</span></div><p>{selectedClass.name} <span className="divider">·</span> {selectedClass.schedule || 'Chưa có lịch học'} <span className="divider">·</span> {selectedClass.room || 'Chưa có phòng'}</p></div><button className="secondary-button"><Settings size={16} /> Quản lý lớp</button></section>

          <div className="tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.id === 'assignments' && <span className="tab-count">4</span>}</button>)}</div>

          {activeTab === 'overview' && <Overview classId={selectedClass.id} selectedClass={selectedClass} onAttendance={() => setActiveTab('attendance')} />}
          {activeTab === 'students' && <Students classId={selectedClass.id} />}
          {activeTab === 'attendance' && <Attendance classId={selectedClass.id} />}
          {activeTab === 'assignments' && <Assignments classId={selectedClass.id} />}
        </div>
      </main>

      {showClassModal && <div className="modal-backdrop" onMouseDown={() => setShowClassModal(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="modal-icon"><Users size={18} /></span><h2>Tạo lớp học mới</h2><p>Thiết lập thông tin lớp để bắt đầu quản lý.</p></div><button className="icon-button" onClick={() => setShowClassModal(false)} aria-label="Đóng"><X size={19} /></button></div><form onSubmit={createClass}><label>Tên lớp học<input name="name" placeholder="Ví dụ: Kinh tế vi mô K60" required /></label><label>Mã lớp<input name="code" placeholder="Ví dụ: KTVM-K60" required /></label><div className="form-row"><label>Môn học<input name="subject" placeholder="Kinh tế vi mô" /></label><label>Phòng học<input name="room" placeholder="A302" /></label></div><label>Lịch học<input name="schedule" placeholder="Thứ 2, 18:00 - 20:00" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowClassModal(false)}>Hủy</button><button className="primary-button" type="submit"><Plus size={17} /> Tạo lớp</button></div></form></div></div>}
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{label === 'Bài kiểm tra' && <span className="nav-count">4</span>}</button> }

function Overview({ onAttendance, classId, selectedClass }) {
  const [classStudents, setClassStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [attendance, setAttendance] = useState({ sessions: [], records: [] })
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([api.getStudents(classId), api.getAssignments(classId), api.getAttendance(classId)])
      .then(([nextStudents, nextAssignments, nextAttendance]) => { setClassStudents(nextStudents); setAssignments(nextAssignments); setAttendance(nextAttendance) })
      .catch((requestError) => setError(requestError.message))
  }, [classId])
  const latestSession = attendance.sessions.at(-1)
  const latestRecords = latestSession ? attendance.records.filter((record) => record.sessionId === latestSession.id) : []
  const presentCount = latestRecords.filter((record) => record.status === 'present').length
  const lateCount = latestRecords.filter((record) => record.status === 'late').length
  const absentCount = latestRecords.filter((record) => record.status === 'absent').length
  const attendanceTotal = latestRecords.length || classStudents.length
  const attendanceRate = attendanceTotal ? Math.round(((presentCount + lateCount) / attendanceTotal) * 100) : 0
  const studentStatus = (student) => latestRecords.find((record) => record.studentId === student.id)?.status || student.status || 'absent'
  return <>
    {error && <p className="interaction-hint">{error}</p>}
    <section className="stat-grid"><StatCard icon={<Users />} label="Học sinh" value={classStudents.length} note="Đang trong lớp" tone="green" /><StatCard icon={<CalendarDays />} label="Buổi học" value={selectedClass.sessionCount || 0} note="Đã tạo trên hệ thống" tone="blue" /><StatCard icon={<ClipboardCheck />} label="Bài kiểm tra" value={assignments.length} note="Đã giao cho lớp" tone="orange" /><StatCard icon={<Zap />} label="Tỷ lệ tham dự" value={`${attendanceRate}%`} note="Theo phiên gần nhất" tone="violet" /></section>
    <div className="dashboard-grid"><section className="panel attendance-panel"><div className="panel-head"><div><span className="section-kicker">ĐIỂM DANH GẦN NHẤT</span><h3>{latestSession ? `Mã ${latestSession.code}` : 'Chưa có phiên điểm danh'}</h3></div><button className="text-button" onClick={onAttendance}>Xem chi tiết <span>→</span></button></div><div className="attendance-summary"><div className="attendance-total"><strong>{attendanceTotal}</strong><span>học sinh</span><div className="progress"><span style={{ width: `${attendanceRate}%` }} /></div><small>{presentCount + lateCount} đã điểm danh</small></div><div className="attendance-legend"><Legend color="green" label="Có mặt" value={presentCount} /><Legend color="yellow" label="Đi muộn" value={lateCount} /><Legend color="red" label="Vắng" value={absentCount} /></div></div><button className="attendance-cta" onClick={onAttendance}><ClipboardCheck size={18} /> Mở điểm danh <span>→</span></button></section><section className="panel upcoming-panel"><div className="panel-head"><div><span className="section-kicker">SẮP TỚI</span><h3>Lịch hoạt động</h3></div><button className="icon-button"><CalendarDays size={18} /></button></div>{assignments.slice(0, 3).map((assignment) => <Upcoming key={assignment.id} icon={<ClipboardCheck />} date={new Date(assignment.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })} title={assignment.title} meta={`Hạn nộp · ${new Date(assignment.dueAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`} tone="orange" />)}{!assignments.length && <p className="interaction-hint">Chưa có bài tập nào.</p>}</section></div>
    <section className="panel recent-panel"><div className="panel-head"><div><span className="section-kicker">HOẠT ĐỘNG GẦN ĐÂY</span><h3>Học sinh trong lớp</h3></div><button className="text-button" onClick={() => onAttendance()}>Xem tất cả <span>→</span></button></div><div className="student-table"><div className="table-row table-head"><span>HỌC SINH</span><span>TRẠNG THÁI HÔM NAY</span><span>ĐIỂM TB</span><span /></div>{classStudents.slice(0, 4).map((student) => <div className="table-row" key={student.id}><div className="student-cell"><div className="avatar avatar-table">{student.name.split(' ').map((part) => part[0]).slice(-2).join('')}</div><div><strong>{student.name}</strong><small>{student.id}</small></div></div><span className={`status ${studentStatus(student)}`}><span /> {statusLabels[studentStatus(student)]}</span><strong>{student.score ?? '--'}</strong><button className="row-arrow" aria-label={`Xem ${student.name}`}>→</button></div>)}</div></section>
  </>
}

function StatCard({ icon, label, value, note, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small className={tone === 'green' ? 'positive' : ''}>{note}</small></div> }
function Legend({ color, label, value }) { return <div><span className={`legend-dot ${color}`} /><span>{label}</span><strong>{value}</strong></div> }
function Upcoming({ icon, date, title, meta, tone }) { return <div className="upcoming-item"><div className={`upcoming-icon ${tone}`}>{icon}</div><div className="upcoming-date">{date}</div><div className="upcoming-copy"><strong>{title}</strong><small>{meta}</small></div><span className="row-arrow">→</span></div> }
function Students({ classId }) {
  const [classStudents, setClassStudents] = useState(students.concat([{ name: 'Vũ Hải Nam', id: 'HS00159', status: 'present', score: '8.4', initials: 'VN' }]))
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!classId) return
    api.getStudents(classId)
      .then((items) => setClassStudents(items.map((student) => ({ ...student, initials: student.name.split(' ').map((part) => part[0]).slice(-2).join(''), score: student.score ?? '--' }))))
      .catch((requestError) => setError(requestError.message))
  }, [classId])
  function addStudent(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = form.get('name')?.trim()
    const id = form.get('id')?.trim().toUpperCase()
    if (!name || !id) return
    api.addStudent(classId, { name, id })
      .then((created) => {
        setClassStudents((current) => [...current, { ...created, score: '--', initials: name.split(' ').map((part) => part[0]).slice(-2).join('') }])
        event.currentTarget.reset()
        setShowForm(false)
      })
      .catch((requestError) => setError(requestError.message))
  }
  return <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">DANH SÁCH LỚP</span><h3>{classStudents.length} học sinh</h3></div><button className="secondary-button" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Thêm học sinh</button></div>{error && <p className="interaction-hint">{error}</p>}{showForm && <form className="inline-form" onSubmit={addStudent}><input name="name" placeholder="Họ và tên học sinh" required /><input name="id" placeholder="Mã học sinh" required /><button className="primary-button" type="submit">Thêm</button></form>}<div className="student-table">{classStudents.map((student) => <div className="table-row" key={student.id}><div className="student-cell"><div className="avatar avatar-table">{student.initials}</div><div><strong>{student.name}</strong><small>{student.id}</small></div></div><span className={`status ${student.status}`}><span /> {statusLabels[student.status]}</span><strong>{student.score}</strong><button className="row-arrow">→</button></div>)}</div></section>
}
function Attendance({ classId }) {
  const [records, setRecords] = useState([])
  const [session, setSession] = useState(null)
  const [qrData, setQrData] = useState('')
  const [error, setError] = useState('')
  const order = ['present', 'late', 'absent', 'excused']
  async function loadAttendance() {
    try {
      const [classStudents, attendance] = await Promise.all([api.getStudents(classId), api.getAttendance(classId)])
      const latest = attendance.sessions.at(-1)
      setSession(latest || null)
      const sessionRecords = latest ? attendance.records.filter((record) => record.sessionId === latest.id) : []
      setRecords(classStudents.map((student) => {
        const record = sessionRecords.find((item) => item.studentId === student.id)
        return { ...student, recordId: record?.id, status: record?.status || student.status || 'absent', initials: student.name.split(' ').map((part) => part[0]).slice(-2).join('') }
      }))
    } catch (requestError) {
      setError(requestError.message)
    }
  }
  useEffect(() => { loadAttendance() }, [classId])
  async function createSession() {
    try {
      const createdSession = await api.createAttendanceSession(classId, { expiresInMinutes: 2 })
      const payload = JSON.stringify({ type: 'attendance', sessionId: createdSession.id, code: createdSession.code, expiresAt: createdSession.expiresAt })
      setQrData(await QRCode.toDataURL(payload, { width: 220, margin: 2, errorCorrectionLevel: 'M' }))
      await loadAttendance()
    } catch (requestError) { setError(requestError.message) }
  }
  async function cycleStatus(record) {
    const nextStatus = order[(order.indexOf(record.status) + 1) % order.length]
    if (!record.recordId) return
    try { await api.updateAttendance(record.recordId, nextStatus); setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: nextStatus } : item)) } catch (requestError) { setError(requestError.message) }
  }
  function exportAttendance() {
    if (!records.length) return
    const rows = [['Mã học sinh', 'Họ tên', 'Trạng thái', 'Thời gian cập nhật'], ...records.map((record) => [record.id, record.name, statusLabels[record.status], record.checkedAt ? new Date(record.checkedAt).toLocaleString('vi-VN') : ''])]
    const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')}`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `diem-danh-${session?.code || 'lop-hoc'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">ĐIỂM DANH</span><h3>Buổi 05 <span>· Chủ nhật, 06/09/2026</span></h3></div><button className="primary-button" onClick={createSession}><QrCode size={17} /> Tạo mã điểm danh</button></div>{error && <p className="interaction-hint">{error}</p>}{qrData && session && <div className="qr-panel"><img src={qrData} alt={`QR điểm danh ${session.code}`} /><div><span className="section-kicker">ĐIỂM DANH BẰNG QR</span><strong>Mã {session.code}</strong><small>Hết hạn lúc {new Date(session.expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small><button className="secondary-button" onClick={() => setQrData('')}>Ẩn QR</button></div></div>}<div className="attendance-toolbar"><span><Clock3 size={16} /> {session ? <>Mã phiên <strong>{session.code}</strong></> : 'Chưa có phiên điểm danh'}</span><button className="secondary-button" onClick={exportAttendance} disabled={!records.length}>Xuất lịch sử</button></div><p className="interaction-hint">{session ? 'Bấm vào trạng thái để cập nhật và lưu điểm danh.' : 'Tạo mã điểm danh để mở phiên cho học sinh.'}</p><div className="student-table">{records.map((student, index) => <div className="table-row" key={student.id}><div className="student-cell"><div className="avatar avatar-table">{student.initials}</div><div><strong>{student.name}</strong><small>{student.id}</small></div></div><button className={`status-select ${student.status}`} onClick={() => cycleStatus(student)}>{statusLabels[student.status]} <ChevronDown size={14} /></button><span className="attendance-time">18:0{index + 1}</span><button className="row-arrow">→</button></div>)}</div></section>
}
function Assignments({ classId }) {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { api.getAssignments(classId).then((data) => setItems(data.map((item) => ({ ...item, type: item.type === 'exam' ? 'Bài kiểm tra' : 'Tài liệu PDF', due: `Hạn nộp ${new Date(item.dueAt).toLocaleDateString('vi-VN')}`, progress: item.submitted ? `${item.submitted}/${item.total} đã nộp` : 'Chưa nộp', tone: item.type === 'exam' ? 'orange' : 'blue' })))).catch((requestError) => setError(requestError.message)) }, [classId])
  async function addAssignment(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const item = await api.createAssignment(classId, { title: form.get('title'), type: 'exam', dueAt: new Date(`${form.get('due')}T23:59:00`).toISOString() }); setItems((current) => [...current, { ...item, type: 'Bài kiểm tra', due: `Hạn nộp ${new Date(item.dueAt).toLocaleDateString('vi-VN')}`, progress: 'Chưa nộp', tone: 'orange' }]); event.currentTarget.reset(); setShowForm(false) } catch (requestError) { setError(requestError.message) } }
  return <section className="panel full-panel"><div className="panel-head"><div><span className="section-kicker">BÀI TẬP VÀ KIỂM TRA</span><h3>{items.length} hoạt động</h3></div><button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Giao bài tập</button></div>{error && <p className="interaction-hint">{error}</p>}{showForm && <form className="inline-form" onSubmit={addAssignment}><input name="title" placeholder="Tên bài tập" required /><input name="due" type="date" required /><button className="primary-button" type="submit">Giao bài</button></form>}<div className="assignment-list">{items.map((item) => <Assignment key={item.id} {...item} />)}</div></section>
}
function Assignment({ title, type, due, progress, tone }) { return <div className="assignment-row"><div className={`assignment-icon ${tone}`}><BookOpen size={19} /></div><div><strong>{title}</strong><small>{type} <span>·</span> {due}</small></div><span className={`assignment-progress ${tone}`}>{progress}</span><button className="row-arrow">→</button></div> }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
