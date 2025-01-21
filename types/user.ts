import { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type UserResponse = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;
