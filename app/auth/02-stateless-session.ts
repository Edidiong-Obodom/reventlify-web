import "server-only";

import type { LoginResponse, SessionPayload } from "@/app/auth/definitions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

const secretKey = process.env.SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Partial<SessionPayload>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3hr")
    .sign(key);
}

export const decrypt = async (
  session: string | undefined = ""
): Promise<Partial<SessionPayload> | null> => {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as Partial<SessionPayload>;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export async function createSession(payload: LoginResponse) {
  const expiresAt = new Date(payload.expiresAt * 1000);
  const dataToEncrypt: Partial<SessionPayload> = { ...payload.user, expiresAt };
  const session = await encrypt(dataToEncrypt);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

export const userSession = async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  return session;
};

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
