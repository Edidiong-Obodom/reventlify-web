import { GetRegimes } from "../interfaces/regimeInterface";

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
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lastLocationUpdate: string | null;
  followersCount?: number;
  followingCount?: number;
}

export interface PublicProfile {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string;
  photo: string | null;
  bio: string | null;
  interests: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export const getProfile = async (token: string): Promise<ProfileData> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

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
  payload: UpdateProfilePayload,
): Promise<ProfileData> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to update profile");
  }

  const data = await res.json();
  return data.data;
};

export const updateProfileLocation = async (
  token: string,
  payload: { latitude: number; longitude: number; force?: boolean },
): Promise<{
  success: boolean;
  skipped: boolean;
  data: {
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    lastLocationUpdate: string | null;
  };
}> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile/location`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to update location");
  }

  return res.json();
};

export const getUserProfileById = async (
  token: string,
  userId: string,
): Promise<PublicProfile> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  const data = await res.json();
  return data.data;
};

export const followUser = async (
  token: string,
  userId: string,
): Promise<{ success: boolean; following: boolean }> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile/${userId}/follow`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to follow user");
  }

  return res.json();
};

export const unfollowUser = async (
  token: string,
  userId: string,
): Promise<{ success: boolean; following: boolean }> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile/${userId}/follow`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to unfollow user");
  }

  return res.json();
};

export const getUserRegimes = async (
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 10,
  participant: boolean = false,
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/profile/${userId}/regimes?page=${page}&limit=${limit}&participant=${participant}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user regimes");
  }

  return res.json();
};
