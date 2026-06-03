import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { DEFAULT_LOGGED_ROUTE, LOGIN_ROUTE } from "@/lib/constants/tournament";
import { getCurrentSessionFromCookies } from "@/lib/auth/session";

export async function requireAuth() {
  const session = await getCurrentSessionFromCookies();

  if (!session) {
    redirect(LOGIN_ROUTE);
  }

  const dbUser = await prisma.users.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      username: true,
      display_name: true,
      role: true,
      is_active: true,
      has_paid: true,
    },
  });

  if (!dbUser || !dbUser.is_active || !dbUser.has_paid) {
    redirect(LOGIN_ROUTE);
  }

  return dbUser;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    redirect(DEFAULT_LOGGED_ROUTE);
  }

  return user;
}
