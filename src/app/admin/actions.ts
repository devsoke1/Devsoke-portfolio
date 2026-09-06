"use server";

import { redirect } from "next/navigation";
import {
  AuthConfigurationError,
  createAdminSession,
  destroyCurrentAdminSession,
  isValidAdminEmail,
  normalizeAdminEmail,
  verifyAdminCredentials,
} from "@/lib/auth/session";

export type LoginFormState = {
  error: string;
};

const INVALID_LOGIN_STATE: LoginFormState = {
  error: "Invalid email or password.",
};

export async function loginAdmin(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = normalizeAdminEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminEmail(email) || password.length === 0) {
    return INVALID_LOGIN_STATE;
  }

  try {
    const admin = await verifyAdminCredentials(email, password);

    if (!admin) {
      return INVALID_LOGIN_STATE;
    }

    await createAdminSession(admin.id);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      console.error("Admin authentication is not configured.");
      return { error: "Authentication is not configured." };
    }

    console.error("Admin login failed.");
    return INVALID_LOGIN_STATE;
  }

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await destroyCurrentAdminSession();
  redirect("/admin/login");
}
