import { Enrollment } from '@prisma/client';

export function isEnrollmentActive(
  enrollment: Pick<Enrollment, 'status' | 'expiresAt'>,
): boolean {
  if (enrollment.status !== 'ACTIVE') return false;
  if (enrollment.expiresAt && enrollment.expiresAt < new Date()) return false;
  return true;
}
