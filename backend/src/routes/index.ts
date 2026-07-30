import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as auth from '../controllers/auth.controller';
import * as courses from '../controllers/courses.controller';
import * as sessions from '../controllers/sessions.controller';
import * as enrollments from '../controllers/enrollments.controller';
import * as teachers from '../controllers/teachers.controller';
import * as contact from '../controllers/contact.controller';
import * as materials from '../controllers/materials.controller';
import * as users from '../controllers/users.controller';
import * as misc from '../controllers/misc.controller';

import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadMaterial } from '../middleware/upload';

const router = Router();

/** Limite les formulaires publics : anti-spam et anti-force brute. */
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Merci de réessayer dans quelques minutes.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ---------------------------------------------------------------- Public
router.get('/courses', courses.listPublicCourses);
router.get('/courses/:slug', courses.getPublicCourse);
router.get('/sessions/upcoming', sessions.listUpcomingSessions);
router.get('/teachers', teachers.listPublicTeachers);
router.get('/teachers/:id', teachers.getPublicTeacher);
router.get('/testimonials', misc.listTestimonials);
router.get('/stats', misc.publicStats);
router.get('/certificates/verify/:serial', enrollments.verifyCertificate);

router.post(
  '/enrollments/request',
  publicFormLimiter,
  validate(enrollments.enrollmentRequestSchema),
  enrollments.requestEnrollment
);
router.post('/contact', publicFormLimiter, validate(contact.contactSchema), contact.submitContact);

// ------------------------------------------------------ Authentification
router.post('/auth/login', loginLimiter, validate(auth.loginSchema), auth.login);
router.get('/auth/me', requireAuth, auth.me);
router.patch('/auth/me', requireAuth, validate(auth.updateProfileSchema), auth.updateProfile);
router.post(
  '/auth/change-password',
  requireAuth,
  validate(auth.changePasswordSchema),
  auth.changePassword
);

// ------------------------------------------------- Espace stagiaire
router.get('/me/enrollments', requireRole('STUDENT', 'ADMIN'), enrollments.listMyEnrollments);
router.get('/me/materials', requireAuth, materials.listMyMaterials);
router.get('/certificates/:id/download', requireAuth, enrollments.downloadCertificate);

// ------------------------------------------------- Espace formateur
router.get('/me/sessions', requireRole('TEACHER', 'ADMIN'), sessions.listMySessions);
router.get('/sessions/:id/roster', requireRole('TEACHER', 'ADMIN'), sessions.listSessionRoster);
router.get('/sessions/:sessionId/materials', requireAuth, materials.listSessionMaterials);
router.put(
  '/me/teacher-profile',
  requireRole('TEACHER', 'ADMIN'),
  validate(teachers.teacherProfileSchema),
  teachers.upsertMyTeacherProfile
);
router.post(
  '/materials',
  requireRole('TEACHER', 'ADMIN'),
  uploadMaterial.single('file'),
  materials.createMaterial
);
router.delete('/materials/:id', requireRole('TEACHER', 'ADMIN'), materials.deleteMaterial);

// ------------------------------------------------------- Administration
const admin = Router();
admin.use(requireRole('ADMIN'));

admin.get('/stats', misc.adminStats);

admin.get('/courses', courses.listAllCourses);
admin.post('/courses', validate(courses.courseSchema), courses.createCourse);
admin.patch('/courses/:id', validate(courses.courseUpdateSchema), courses.updateCourse);
admin.delete('/courses/:id', courses.deleteCourse);

admin.get('/sessions', sessions.listAllSessions);
admin.get('/sessions/:id', sessions.getSession);
admin.post('/sessions', validate(sessions.sessionSchema), sessions.createSession);
admin.patch('/sessions/:id', validate(sessions.sessionUpdateSchema), sessions.updateSession);
admin.delete('/sessions/:id', sessions.deleteSession);

admin.get('/enrollments', enrollments.listEnrollments);
admin.patch('/enrollments/:id', validate(enrollments.enrollmentUpdateSchema), enrollments.updateEnrollment);
admin.delete('/enrollments/:id', enrollments.deleteEnrollment);
admin.post('/enrollments/:id/certificate', enrollments.issueCertificate);

admin.get('/users', users.listUsers);
admin.get('/users/:id', users.getUser);
admin.post('/users', validate(users.createUserSchema), users.createUser);
admin.patch('/users/:id', validate(users.updateUserSchema), users.updateUser);
admin.post('/users/:id/reset-password', users.resetUserPassword);
admin.delete('/users/:id', users.deleteUser);

admin.get('/contact-messages', contact.listContactMessages);
admin.patch('/contact-messages/:id', contact.markContactRead);
admin.delete('/contact-messages/:id', contact.deleteContactMessage);

router.use('/admin', admin);

export default router;
