export interface ProfileData {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string;
  photo: string | null;
  bio: string | null;
  interests: string[];
}

export const getProfile = async (token: string): Promise<ProfileData> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  const data = await res.json();
  return data.data;
};

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  interests?: string[];
  photoBase64?: string | null;
}

export const updateProfile = async (
  token: string,
  payload: UpdateProfilePayload
): Promise<ProfileData> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to update profile");
  }

  const data = await res.json();
  return data.data;
};

