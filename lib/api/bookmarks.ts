import { GetRegimes } from "../interfaces/regimeInterface";

export const getBookmarkedRegimes = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/bookmarks?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch bookmarks");
  }

  return res.json();
};

export const getBookmarkIds = async (token: string): Promise<string[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/bookmarks/ids`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch bookmark ids");
  }

  const data = await res.json();
  return data.data ?? [];
};

export const bookmarkRegime = async (
  token: string,
  regimeId: string
): Promise<{ success: boolean; bookmarked: boolean }> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/bookmark`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ regimeId }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to bookmark regime");
  }

  return res.json();
};

export const unbookmarkRegime = async (
  token: string,
  regimeId: string
): Promise<{ success: boolean; bookmarked: boolean }> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/bookmark`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ regimeId }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "Failed to remove bookmark");
  }

  return res.json();
};

