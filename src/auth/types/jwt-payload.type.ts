import { Role } from '@prisma/client';

export type JWTPayLoad = {
  sub: string;
  email: string;
  role: Role;
};
