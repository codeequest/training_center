-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('ONSITE', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'OPEN', 'FULL', 'RUNNING', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'SLIDES', 'LINK', 'VIDEO');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('ENROLLED', 'PUBLIC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headlineFr" TEXT NOT NULL,
    "headlineEn" TEXT NOT NULL,
    "bioFr" TEXT NOT NULL,
    "bioEn" TEXT NOT NULL,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkedinUrl" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "summaryFr" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "audienceFr" TEXT NOT NULL,
    "audienceEn" TEXT NOT NULL,
    "prerequisitesFr" TEXT NOT NULL,
    "prerequisitesEn" TEXT NOT NULL,
    "level" "Level" NOT NULL DEFAULT 'BEGINNER',
    "durationHours" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TND',
    "coverImageUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#0F766E',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scheduleFr" TEXT NOT NULL,
    "scheduleEn" TEXT NOT NULL,
    "mode" "SessionMode" NOT NULL DEFAULT 'ONSITE',
    "location" TEXT,
    "meetingUrl" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 15,
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "company" TEXT,
    "message" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "sessionId" TEXT,
    "uploaderId" TEXT,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL DEFAULT 'PDF',
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "visibility" "Visibility" NOT NULL DEFAULT 'ENROLLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "quoteFr" TEXT NOT NULL,
    "quoteEn" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_isPublished_idx" ON "Course"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_position_key" ON "Module"("courseId", "position");

-- CreateIndex
CREATE INDEX "Session_courseId_startDate_idx" ON "Session"("courseId", "startDate");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Enrollment_requesterEmail_idx" ON "Enrollment"("requesterEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_sessionId_studentId_key" ON "Enrollment"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Material_sessionId_idx" ON "Material"("sessionId");

-- CreateIndex
CREATE INDEX "Material_courseId_idx" ON "Material"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON "Certificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_serialNumber_key" ON "Certificate"("serialNumber");

-- CreateIndex
CREATE INDEX "ContactMessage_isRead_idx" ON "ContactMessage"("isRead");

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
