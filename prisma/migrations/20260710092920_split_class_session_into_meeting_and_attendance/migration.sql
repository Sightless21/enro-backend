/*
  Warnings:

  - The values [EXPIRED] on the enum `EnrollmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('SCHEDULED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "EnrollmentStatus_new" AS ENUM ('ACTIVE', 'CANCELLED');
ALTER TABLE "public"."Enrollment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Enrollment" ALTER COLUMN "status" TYPE "EnrollmentStatus_new" USING ("status"::text::"EnrollmentStatus_new");
ALTER TYPE "EnrollmentStatus" RENAME TO "EnrollmentStatus_old";
ALTER TYPE "EnrollmentStatus_new" RENAME TO "EnrollmentStatus";
DROP TYPE "public"."EnrollmentStatus_old";
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- CreateTable
CREATE TABLE "ClassMeeting" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "meetingLink" TEXT,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAttendance" (
    "id" TEXT NOT NULL,
    "classMeetingId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassMeeting_courseId_idx" ON "ClassMeeting"("courseId");

-- CreateIndex
CREATE INDEX "ClassMeeting_teacherId_idx" ON "ClassMeeting"("teacherId");

-- CreateIndex
CREATE INDEX "ClassMeeting_scheduledAt_idx" ON "ClassMeeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "ClassAttendance_enrollmentId_idx" ON "ClassAttendance"("enrollmentId");

-- CreateIndex
CREATE INDEX "ClassAttendance_studentId_idx" ON "ClassAttendance"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAttendance_classMeetingId_studentId_key" ON "ClassAttendance"("classMeetingId", "studentId");

-- AddForeignKey
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttendance" ADD CONSTRAINT "ClassAttendance_classMeetingId_fkey" FOREIGN KEY ("classMeetingId") REFERENCES "ClassMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttendance" ADD CONSTRAINT "ClassAttendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttendance" ADD CONSTRAINT "ClassAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
