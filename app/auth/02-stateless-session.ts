import "server-only";

import type { LoginResponse, SessionPayload } from "@/app/auth/definitions";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secretKey = process.env.SECRET;

export async function decrypt(session: string | undefined = "") {
  try {
    let payload: Partial<SessionPayload> = {};
    verify(session, secretKey as string, (error, data) => {
      payload = data as Partial<SessionPayload>;
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: LoginResponse) {
  const expiresAt = new Date(payload.expiresAt * 1000);
  const session = payload.data.token;

  (await cookies()).set("session", session as string, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.user) {
    redirect("/login");
  }

  return { isAuth: true, userId: Number(session.user) };
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
  redirect("/login");
}
