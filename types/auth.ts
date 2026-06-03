import { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
};

export type SessionPayload = {
  sub: string;
  username: string;
  display_name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};
