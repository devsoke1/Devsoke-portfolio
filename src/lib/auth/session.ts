import "server-only";

import { randomBytes, createHmac } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import type { AdminRole } from "@prisma/client";
import db from "@/lib/db";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "./constants";

const SESSION_TOKEN_BYTES = 32;
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;
const DUMMY_PASSWORD_HASH =
  "$2b$12$eImiTXuWVxfM37uY4JANjQeq8d.9fY3X5vUFhp8vJq.5IY2h6qZ6a";

export type CurrentAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  sessionExpiresAt: Date;
};

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new AuthConfigurationError("AUTH_SECRET must be set to at least 32 characters.");
  }

  return secret;
}

function createSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

function getSessionTokenHash(token: string) {
  return createHmac("sha256", getAuthSecret()).update(token).digest("hex");
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidAdminEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = normalizeAdminEmail(email);

  if (!isValidAdminEmail(normalizedEmail) || password.length === 0) {
    await compare(password || "invalid", DUMMY_PASSWORD_HASH);
    return null;
  }

  const admin = await db.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  const passwordHash = admin?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await compare(password, passwordHash);

  if (!admin || !passwordMatches) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

export async function createAdminSession(adminId: string) {
  const token = createSessionToken();
  const tokenHash = getSessionTokenHash(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);

  await db.$transaction([
    db.adminSession.deleteMany({
      where: {
        OR: [{ adminUserId: adminId }, { expiresAt: { lt: new Date() } }],
      },
    }),
    db.adminSession.create({
      data: {
        tokenHash,
        adminUserId: adminId,
        expiresAt,
      },
    }),
    db.adminUser.update({
      where: { id: adminId },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    ...getCookieOptions(),
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  });
}

export async function destroyCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token && SESSION_TOKEN_PATTERN.test(token)) {
    try {
      await db.adminSession.deleteMany({
        where: { tokenHash: getSessionTokenHash(token) },
      });
    } catch (error) {
      if (!(error instanceof AuthConfigurationError)) {
        console.error("Failed to delete admin session.");
      }
    }
  }

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}

export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
    return null;
  }

  let tokenHash: string;
  try {
    tokenHash = getSessionTokenHash(token);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      console.error("Admin authentication is not configured.");
      return null;
    }

    throw error;
  }

  const session = await db.adminSession.findUnique({
    where: { tokenHash },
    select: {
      expiresAt: true,
      adminUser: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    ...session.adminUser,
    sessionExpiresAt: session.expiresAt,
  };
});

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdminForMutation() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  return admin;
}

export async function redirectAuthenticatedAdmin() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin/dashboard");
  }
}
