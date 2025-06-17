import { GetRegimes } from "../interfaces/regimeInterface";

export const getRegimes = async (
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/v1/user/regime/view?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch regimes");
  }

  return res.json();
};

export const getPopularRegimes = async (
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/v1/user/regime/view/popular?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch regimes");
  }

  return res.json();
};
