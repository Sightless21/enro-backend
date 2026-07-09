/*
  Warnings:

  - You are about to drop the column `billType` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `includeManualBook` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `slipUrl` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,providerUserId]` on the table `AuthProvider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pricingPlanId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('FIXED_TERM', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('MONTHLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('EBOOK', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'WAITING_VERIFICATION', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClassSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "billType",
DROP COLUMN "price",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "durationMonths" INTEGER,
ADD COLUMN     "format" "CourseFormat" NOT NULL DEFAULT 'FIXED_TERM',
ADD COLUMN     "hoursPerSession" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" "JlptLevel",
ADD COLUMN     "sessionsPerWeek" INTEGER,
ADD COLUMN     "totalSessions" INTEGER,
ALTER COLUMN "totalHours" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "includeManualBook",
DROP COLUMN "slipUrl",
ADD COLUMN     "bookOptionId" TEXT,
ADD COLUMN     "pricingPlanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "jlptLevel" "JlptLevel";

-- DropEnum
DROP TYPE "BillType";

-- CreateTable
CREATE TABLE "CourseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CourseType" NOT NULL,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePricingPlan" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "price" INTEGER NOT NULL,
    "installmentCount" INTEGER NOT NULL DEFAULT 1,
    "savingAmount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CoursePricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBookOption" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "BookType" NOT NULL,
    "price" INTEGER,

    CONSTRAINT "CourseBookOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "slipUrl" TEXT,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "meetingLink" TEXT,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_name_type_key" ON "CourseCategory"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePricingPlan_courseId_name_key" ON "CoursePricingPlan"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseBookOption_courseId_type_key" ON "CourseBookOption"("courseId", "type");

-- CreateIndex
CREATE INDEX "Installment_orderId_idx" ON "Installment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_orderId_seq_key" ON "Installment"("orderId", "seq");

-- CreateIndex
CREATE INDEX "ClassSession_enrollmentId_idx" ON "ClassSession"("enrollmentId");

-- CreateIndex
CREATE INDEX "ClassSession_teacherId_idx" ON "ClassSession"("teacherId");

-- CreateIndex
CREATE INDEX "ClassSession_scheduledAt_idx" ON "ClassSession"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthProvider_provider_providerUserId_key" ON "AuthProvider"("provider", "providerUserId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePricingPlan" ADD CONSTRAINT "CoursePricingPlan_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBookOption" ADD CONSTRAINT "CourseBookOption_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "CoursePricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookOptionId_fkey" FOREIGN KEY ("bookOptionId") REFERENCES "CourseBookOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
