import { GetTransactions } from "../interfaces/transactionInterface";

export const getTransactions = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<GetTransactions> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/user/transactions/list`;
  const url = new URL(baseUrl);

  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  url.search = new URLSearchParams(params).toString();

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return res.json();
};

export const searchForTransactions = async (
  token: string,
  searchTerm: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10
): Promise<GetTransactions> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/user/transactions/search`;
  const url = new URL(baseUrl);

  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
    searchTerm: searchTerm,
  };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  url.search = new URLSearchParams(params).toString();

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return res.json();
};
