import { authFetch } from './auth-client';

export type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface StudentCourse {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  accentColor: string;
  durationHours: number;
}

export interface StudentTeacher {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface StudentSession {
  id: string;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  location: string | null;
  meetingUrl: string | null;
  course: StudentCourse;
  teacher: StudentTeacher | null;
}

export interface StudentCertificate {
  id: string;
  serialNumber: string;
  issuedAt: string;
}

export interface StudentEnrollment {
  id: string;
  status: EnrollmentStatus;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  certificate: StudentCertificate | null;
  session: StudentSession;
}

export function listMyEnrollments(): Promise<{ enrollments: StudentEnrollment[] }> {
  return authFetch<{ enrollments: StudentEnrollment[] }>('/me/enrollments');
}

export interface StudentMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'SLIDES' | 'LINK' | 'VIDEO';
  fileUrl: string;
  fileSize: number | null;
  createdAt: string;
  session: { id: string; startDate: string; course: { titleFr: string; titleEn: string } } | null;
  course: { id: string; titleFr: string; titleEn: string } | null;
}

export function listMyMaterials(): Promise<{ materials: StudentMaterial[] }> {
  return authFetch<{ materials: StudentMaterial[] }>('/me/materials');
}
