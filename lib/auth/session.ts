import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "@/lib/constants/tournament";
import type { SessionPayload, SessionUser } from "@/types/auth";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14; // 14 dias

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }

  return jwtSecret;
}

export function signSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    sub: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: SESSION_DURATION_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as SessionPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
