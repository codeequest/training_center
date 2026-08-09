import { authFetch } from './auth-client';

export type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

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

export function getMyNotifications(): Promise<{ count: number; items: NotificationItem[] }> {
  return authFetch<{ count: number; items: NotificationItem[] }>('/me/notifications');
}

export function markNotificationsSeen(): Promise<{ notificationsSeenAt: string }> {
  return authFetch<{ notificationsSeenAt: string }>('/me/notifications/seen', { method: 'POST' });
}
