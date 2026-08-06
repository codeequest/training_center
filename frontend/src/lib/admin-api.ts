import { authFetch } from './auth-client';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export type SessionStatus = 'PLANNED' | 'OPEN' | 'FULL' | 'RUNNING' | 'DONE' | 'CANCELLED';
export type SessionMode = 'ONSITE' | 'ONLINE' | 'HYBRID';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

function query(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const suffix = qs.toString();
  return suffix ? `?${suffix}` : '';
}

// --- Tableau de bord ---

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  publishedCourses: number;
  openSessions: number;
  pendingRequests: number;
  confirmedEnrollments: number;
  unreadMessages: number;
}

export interface EnrollmentStatusCount {
  status: EnrollmentStatus;
  count: number;
}

export interface RecentEnrollment {
  id: string;
  status: EnrollmentStatus;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
  session: { course: { titleFr: string; titleEn: string } };
}

export function getAdminStats(): Promise<{
  stats: AdminStats;
  enrollmentsByStatus: EnrollmentStatusCount[];
  recentEnrollments: RecentEnrollment[];
}> {
  return authFetch('/admin/stats');
}

// --- Utilisateurs ---

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  locale: 'fr' | 'en';
  isActive: boolean;
  createdAt: string;
  teacherProfile: { id: string; headlineFr: string; isPublished: boolean } | null;
  _count: { enrollments: number; taughtSessions: number };
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role?: Role;
  phone?: string | null;
  locale?: 'fr' | 'en';
  password?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  locale?: 'fr' | 'en';
  isActive?: boolean;
}

export function listAdminUsers(params: { role?: Role; search?: string } = {}): Promise<{ users: AdminUser[] }> {
  return authFetch(`/admin/users${query(params)}`);
}

export function createUser(data: CreateUserInput): Promise<{ user: AdminUser; temporaryPassword?: string }> {
  return authFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) });
}

export function updateUser(id: string, data: UpdateUserInput): Promise<{ user: AdminUser }> {
  return authFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function resetUserPassword(id: string): Promise<{ message: string; temporaryPassword: string }> {
  return authFetch(`/admin/users/${id}/reset-password`, { method: 'POST' });
}

export function deleteUser(id: string): Promise<{ message: string }> {
  return authFetch(`/admin/users/${id}`, { method: 'DELETE' });
}

// --- Formations ---

export interface AdminModule {
  position: number;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export interface AdminCourse {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  descriptionFr: string;
  descriptionEn: string;
  audienceFr: string;
  audienceEn: string;
  prerequisitesFr: string;
  prerequisitesEn: string;
  level: CourseLevel;
  durationHours: number;
  price: string;
  currency: string;
  coverImageUrl: string | null;
  accentColor: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  _count: { sessions: number; modules: number };
  modules?: AdminModule[];
}

export interface CourseInput {
  slug: string;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  descriptionFr: string;
  descriptionEn: string;
  audienceFr: string;
  audienceEn: string;
  prerequisitesFr: string;
  prerequisitesEn: string;
  level: CourseLevel;
  durationHours: number;
  price: number;
  currency: string;
  coverImageUrl?: string | null;
  accentColor: string;
  isPublished: boolean;
  sortOrder: number;
  modules: AdminModule[];
}

export function listAdminCourses(): Promise<{ courses: AdminCourse[] }> {
  return authFetch('/admin/courses');
}

export function createCourse(data: CourseInput): Promise<{ course: AdminCourse }> {
  return authFetch('/admin/courses', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCourse(id: string, data: Partial<CourseInput>): Promise<{ course: AdminCourse }> {
  return authFetch(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteCourse(id: string): Promise<{ message: string }> {
  return authFetch(`/admin/courses/${id}`, { method: 'DELETE' });
}

// --- Sessions ---

export interface AdminSessionTeacher {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface AdminSessionCourseRef {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
}

export interface AdminSession {
  id: string;
  courseId: string;
  teacherId: string | null;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  mode: SessionMode;
  location: string | null;
  meetingUrl: string | null;
  capacity: number;
  status: SessionStatus;
  course: AdminSessionCourseRef;
  teacher: AdminSessionTeacher | null;
  _count: { enrollments: number };
}

export interface SessionInput {
  courseId: string;
  teacherId?: string | null;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  mode: SessionMode;
  location?: string | null;
  meetingUrl?: string | null;
  capacity: number;
  status: SessionStatus;
}

export function listAdminSessions(
  params: { courseId?: string; status?: SessionStatus } = {}
): Promise<{ sessions: AdminSession[] }> {
  return authFetch(`/admin/sessions${query(params)}`);
}

export function createSession(data: SessionInput): Promise<{ session: AdminSession }> {
  return authFetch('/admin/sessions', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSession(id: string, data: Partial<SessionInput>): Promise<{ session: AdminSession }> {
  return authFetch(`/admin/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteSession(id: string): Promise<{ message: string }> {
  return authFetch(`/admin/sessions/${id}`, { method: 'DELETE' });
}

// --- Inscriptions ---

export interface AdminEnrollment {
  id: string;
  status: EnrollmentStatus;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  company: string | null;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  student: { id: string; firstName: string; lastName: string; email: string } | null;
  certificate: { id: string; serialNumber: string } | null;
  session: { id: string; startDate: string; course: { id: string; slug: string; titleFr: string; titleEn: string } };
}

export function listAdminEnrollments(
  params: { status?: EnrollmentStatus; sessionId?: string; search?: string } = {}
): Promise<{ enrollments: AdminEnrollment[] }> {
  return authFetch(`/admin/enrollments${query(params)}`);
}

export function updateEnrollment(
  id: string,
  data: { status?: EnrollmentStatus; adminNotes?: string | null; studentId?: string | null }
): Promise<{ enrollment: AdminEnrollment }> {
  return authFetch(`/admin/enrollments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteEnrollment(id: string): Promise<{ message: string }> {
  return authFetch(`/admin/enrollments/${id}`, { method: 'DELETE' });
}

export function issueCertificate(
  id: string
): Promise<{ certificate: { id: string; serialNumber: string; issuedAt: string }; message?: string }> {
  return authFetch(`/admin/enrollments/${id}/certificate`, { method: 'POST' });
}

// --- Messages de contact ---

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function listContactMessages(unreadOnly = false): Promise<{ messages: AdminContactMessage[]; unreadCount: number }> {
  return authFetch(`/admin/contact-messages${unreadOnly ? '?unreadOnly=true' : ''}`);
}

export function markContactRead(id: string, isRead: boolean): Promise<{ message: AdminContactMessage }> {
  return authFetch(`/admin/contact-messages/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead }) });
}

export function deleteContactMessage(id: string): Promise<{ message: string }> {
  return authFetch(`/admin/contact-messages/${id}`, { method: 'DELETE' });
}

// --- Emails ---

export interface SendEmailInput {
  subject: string;
  body: string;
  role?: 'STUDENT' | 'TEACHER' | 'ALL';
  userIds?: string[];
}

export function sendBulkEmail(data: SendEmailInput): Promise<{ message: string; sentCount: number }> {
  return authFetch('/admin/emails/send', { method: 'POST', body: JSON.stringify(data) });
}
