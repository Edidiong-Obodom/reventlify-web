import { GetRegimes, SearchRegimes } from "../interfaces/regimeInterface";

export const getRegimes = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/view?page=${page}&limit=${limit}`,
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
  limit: number = 10
): Promise<GetRegimes> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/regime/view/popular?page=${page}&limit=${limit}`,
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

export const searchForRegimes = async ({
  searchString,
  type,
  page,
  limit,
}: SearchRegimes): Promise<GetRegimes> => {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/v1/user/regime/search?page=${page}&limit=${limit}&searchString=${searchString}${
      type ? `&type=${type}` : ""
    }`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch regimes");
  }

  return res.json();
};
