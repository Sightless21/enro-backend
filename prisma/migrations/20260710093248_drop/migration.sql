/*
  Warnings:

  - You are about to drop the `ClassSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_studentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_teacherId_fkey";

-- DropTable
DROP TABLE "ClassSession";
