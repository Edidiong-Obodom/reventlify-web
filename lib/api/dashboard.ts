export interface DashboardTicketPerformanceResponse {
  success: boolean;
  data: {
    regimeId: string;
    pricingId: string;
    pricingName: string;
    range: {
      fromDate: string;
      toDate: string;
      days: number;
      duration?: "weekly" | "all_time";
    };
    soldProgress: {
      sold: number;
      total: number;
      left: number;
      soldPercentage: number;
    };
    weeklyTicketSales: Array<{
      date: string;
      day: string;
      sold: number;
    }>;
  };
}

export type DashboardParticipantRole =
  | "super_admin"
  | "admin"
  | "usher"
  | "bouncer"
  | "marketer";

export interface DashboardParticipantsResponse {
  success: boolean;
  data: {
    regimeId: string;
    currentUserRole: string;
    permissions: {
      canManageParticipants: boolean;
      assignableRoles: DashboardParticipantRole[];
    };
    summary: {
      total: number;
      byRole: Record<DashboardParticipantRole, number>;
    };
    participants: Array<{
      id: string;
      participantId: string;
      first_name: string;
      last_name: string;
      name: string;
      email: string;
      userName: string;
      photo: string | null;
      participantRole: DashboardParticipantRole;
      balance: number;
      createdAt: string;
    }>;
  };
}

export interface DashboardParticipantMutationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    participantId: string;
    name: string;
    email: string;
    userName: string;
    photo: string | null;
    participantRole: DashboardParticipantRole;
    balance: number;
    createdAt: string;
  };
}

export interface DashboardTransactionsResponse {
  success: boolean;
  data: {
    regimeId: string;
    page: number;
    limit: number;
    range?: {
      duration: "all_time" | "range";
      fromDate?: string;
      toDate?: string;
    };
    summary: {
      totalTransactions: number;
      salesCount: number;
      transferDebitCount: number;
    };
    transactions: Array<{
      id: string;
      createdAt: string;
      type: "ticket_sale" | "transfer_debit";
      transactionAction: string;
      paymentGateway: string;
      description: string;
      amount: number;
      actualAmount: number;
      companyCharge: number;
      paymentGatewayCharge: number;
      affiliateAmount: number | null;
      actor: {
        id: string | null;
        name: string;
        email: string;
      };
      transferMeta: {
        bankName: string;
        accountNumber: string;
        accountName: string;
      } | null;
    }>;
  };
}

export type DashboardAttendanceFilter = "present" | "stepped-out" | "yet-to-attend";

export interface DashboardAttendanceResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  summary: {
    present: number;
    steppedOut: number;
    yetToAttend: number;
  };
  data: Array<{
    ticketId: string;
    ownerId: string;
    userName: string;
    email: string;
    pricingId: string;
    pricingName: string;
    status: DashboardAttendanceFilter;
    lastAction: string;
    createdAt: string;
  }>;
}

export interface DashboardAttendanceActionResponse {
  success: boolean;
  alreadyCheckedIn?: boolean;
  alreadySteppedOut?: boolean;
  message: string;
  data?: {
    ticketId: string;
    status: "present" | "stepped_out";
    ownerUserName: string;
    pricingName: string;
  };
}

type DashboardApiError = Error & {
  status?: number;
  currentUserRole?: string | null;
};

const buildDashboardApiError = async (
  res: Response,
  fallbackMessage: string,
): Promise<DashboardApiError> => {
  const data = await res.json().catch(() => null);
  const error = new Error(data?.message ?? fallbackMessage) as DashboardApiError;
  error.status = res.status;
  error.currentUserRole =
    data?.data?.currentUserRole ?? data?.currentUserRole ?? null;
  return error;
};

export const getDashboardTicketPerformance = async (
  token: string,
  params: {
    regimeId: string;
    pricingId?: string;
    duration?: "all_time";
    fromDate?: string;
    toDate?: string;
  },
): Promise<DashboardTicketPerformanceResponse> => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/ticket-performance`,
  );
  url.searchParams.set("regimeId", params.regimeId);
  if (params.pricingId) url.searchParams.set("pricingId", params.pricingId);
  if (params.duration) url.searchParams.set("duration", params.duration);
  if (params.fromDate) url.searchParams.set("fromDate", params.fromDate);
  if (params.toDate) url.searchParams.set("toDate", params.toDate);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to fetch dashboard ticket performance",
    );
  }

  return res.json();
};

export const getDashboardParticipants = async (
  token: string,
  params: { regimeId: string },
): Promise<DashboardParticipantsResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/participants`);
  url.searchParams.set("regimeId", params.regimeId);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to fetch dashboard participants",
    );
  }

  return res.json();
};

export const createDashboardParticipant = async (
  token: string,
  body: {
    regimeId: string;
    email: string;
    participantRole: DashboardParticipantRole;
  },
): Promise<DashboardParticipantMutationResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/participants`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to save dashboard participant",
    );
  }

  return res.json();
};

export const updateDashboardParticipant = async (
  token: string,
  body: {
    regimeId: string;
    participantId: string;
    participantRole: DashboardParticipantRole;
  },
): Promise<DashboardParticipantMutationResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/participants`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to update dashboard participant",
    );
  }

  return res.json();
};

export const removeDashboardParticipant = async (
  token: string,
  body: {
    regimeId: string;
    participantId: string;
  },
): Promise<DashboardParticipantMutationResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/participants`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to remove dashboard participant",
    );
  }

  return res.json();
};

export const getDashboardTransactions = async (
  token: string,
  params: {
    regimeId: string;
    duration?: "all_time";
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  },
): Promise<DashboardTransactionsResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/transactions`);
  url.searchParams.set("regimeId", params.regimeId);
  if (params.duration) url.searchParams.set("duration", params.duration);
  if (params.fromDate) url.searchParams.set("fromDate", params.fromDate);
  if (params.toDate) url.searchParams.set("toDate", params.toDate);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to fetch dashboard transactions",
    );
  }

  return res.json();
};

export const getDashboardAttendanceList = async (
  token: string,
  params: {
    regimeId: string;
    page?: number;
    limit?: number;
    filters?: DashboardAttendanceFilter[];
  },
): Promise<DashboardAttendanceResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/attendance/list`);
  url.searchParams.set("regimeId", params.regimeId);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.filters?.length) url.searchParams.set("filters", params.filters.join(","));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to fetch dashboard attendance",
    );
  }

  return res.json();
};

export const searchDashboardAttendance = async (
  token: string,
  params: {
    regimeId: string;
    query: string;
    page?: number;
    limit?: number;
    filters?: DashboardAttendanceFilter[];
  },
): Promise<DashboardAttendanceResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/attendance/search`);
  url.searchParams.set("regimeId", params.regimeId);
  url.searchParams.set("query", params.query);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.filters?.length) url.searchParams.set("filters", params.filters.join(","));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to search dashboard attendance",
    );
  }

  return res.json();
};

export const dashboardAttendanceAction = async (
  token: string,
  body: {
    regimeId: string;
    scannedData: string;
    action?: "check_in" | "step_out";
  },
): Promise<DashboardAttendanceActionResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/dashboard/attendance/action`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw await buildDashboardApiError(
      res,
      "Failed to perform attendance action",
    );
  }

  return res.json();
};
