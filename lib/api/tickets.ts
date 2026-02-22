import { ApiTicket } from "../interfaces/ticketInterface";

interface TransferTicketPayload {
  beneficiary: string;
  ticket: string;
  comment?: string;
}

interface TransferTicketResponse {
  message: string;
}

export const getTickets = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<ApiTicket> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/user/tickets/list`;
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

export const searchForTickets = async (
  token: string,
  searchTerm: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiTicket> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/user/tickets/search`;
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

export const transferTicket = async (
  token: string,
  payload: TransferTicketPayload
): Promise<TransferTicketResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/tickets/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to transfer ticket");
  }

  return res.json();
};
