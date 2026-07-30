/**
 * Types partagés de l'espace formateur, alignés sur les réponses de l'API
 * (voir backend/prisma/schema.prisma et backend/src/controllers/{sessions,materials,teachers,auth}.controller.ts).
 */

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type SessionMode = 'ONSITE' | 'ONLINE' | 'HYBRID';
export type SessionStatus = 'PLANNED' | 'OPEN' | 'FULL' | 'RUNNING' | 'DONE' | 'CANCELLED';
export type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export type MaterialType = 'PDF' | 'SLIDES' | 'LINK' | 'VIDEO';
export type Visibility = 'ENROLLED' | 'PUBLIC';

export interface TeacherProfile {
  id?: string;
  headlineFr: string;
  headlineEn: string;
  bioFr: string;
  bioEn: string;
  certifications: string[];
  linkedinUrl: string | null;
  yearsExperience: number;
  isPublished: boolean;
}

export interface TeacherUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  locale: string;
  createdAt: string;
  teacherProfile: TeacherProfile | null;
}

export interface CourseRef {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  accentColor: string;
}

export interface TeacherSession {
  id: string;
  course: CourseRef;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  mode: SessionMode;
  location: string | null;
  meetingUrl: string | null;
  capacity: number;
  status: SessionStatus;
  _count: { enrollments: number; materials: number };
}

export interface RosterStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface RosterCertificate {
  id: string;
  serialNumber: string;
  issuedAt: string;
}

export interface RosterEnrollment {
  id: string;
  status: EnrollmentStatus;
  student: RosterStudent;
  certificate: RosterCertificate | null;
}

export interface RosterSession {
  id: string;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  mode: SessionMode;
  location: string | null;
  meetingUrl: string | null;
  capacity: number;
  status: SessionStatus;
  course: { titleFr: string; titleEn: string };
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  fileUrl: string;
  fileSize: number | null;
  visibility: Visibility;
  createdAt: string;
}
