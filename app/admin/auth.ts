"use server";

import { cookies } from "next/headers";

const ADMIN_USER = process.env.ADMIN_USERNAME || "tahar";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "tahargents";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    // Set a secure session cookie valid for 7 days
    cookieStore.set("admin_session", "authenticated_token_gq", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/admin",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid administrative credentials." };
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated_token_gq";
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
