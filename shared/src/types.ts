/**
 * Types partagés par le web et le mobile, alignés sur les réponses de l'API Express.
 * Source de vérité : `backend/prisma/schema.prisma` et les contrôleurs correspondants.
 */

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export type SessionMode = 'ONSITE' | 'ONLINE' | 'HYBRID';

export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  locale: 'fr' | 'en';
  createdAt: string;
}

export interface Course {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  level: Level;
  durationHours: number;
  priceDt: number;
}

export interface TrainingSession {
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
}

/** Notifications par rôle — voir `backend/src/controllers/notifications.controller.ts`. */
interface BaseNotification {
  id: string;
  createdAt: string;
  href: string;
}

export interface ContactMessageNotification extends BaseNotification {
  kind: 'contact_message';
  name: string;
  subject: string;
}

export interface NewEnrollmentNotification extends BaseNotification {
  kind: 'new_enrollment';
  requesterName: string;
  courseTitleFr: string;
  courseTitleEn: string;
}

export interface EnrollmentStatusNotification extends BaseNotification {
  kind: 'enrollment_status';
  status: EnrollmentStatus;
  courseTitleFr: string;
  courseTitleEn: string;
}

export interface CertificateNotification extends BaseNotification {
  kind: 'certificate';
  courseTitleFr: string;
  courseTitleEn: string;
}

export type NotificationItem =
  | ContactMessageNotification
  | NewEnrollmentNotification
  | EnrollmentStatusNotification
  | CertificateNotification;
