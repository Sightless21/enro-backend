/*
  Warnings:

  - The `status` column on the `ClassMeeting` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClassMeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- AlterTable
ALTER TABLE "ClassMeeting" DROP COLUMN "status",
ADD COLUMN     "status" "ClassMeetingStatus" NOT NULL DEFAULT 'SCHEDULED';

-- DropEnum
DROP TYPE "ClassSessionStatus";
