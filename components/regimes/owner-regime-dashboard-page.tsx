"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Plus,
  ReceiptText,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createDashboardParticipant,
  getDashboardAttendanceList,
  DashboardParticipantRole,
  getDashboardParticipants,
  getDashboardTicketPerformance,
  getDashboardTransactions,
  removeDashboardParticipant,
  updateDashboardParticipant,
} from "@/lib/api/dashboard";
import { searchForRegimes } from "@/lib/api/regimes";

interface OwnerRegimeDashboardPageProps {
  regimeId: string;
}

type RegimeStatus = "ongoing" | "upcoming" | "ended";
type AccessRole =
  | "creator"
  | "super_admin"
  | "admin"
  | "bouncer"
  | "usher"
  | "marketer";
type AssignableRole = DashboardParticipantRole;

type TransactionItem = {
  id: string;
  createdAt: string;
  type: "ticket_sale" | "transfer_debit";
  actor: {
    name: string;
    email: string;
  };
  amount: number;
  actualAmount: number;
  companyCharge: number;
  paymentGatewayCharge: number;
  affiliateAmount: number | null;
  paymentGateway: string;
  note: string;
};

type ParticipantMember = {
  id: string;
  participantId: string;
  name: string;
  email: string;
  userName: string;
  participantRole: AssignableRole;
};

type ParticipantState = {
  super_admin: ParticipantMember[];
  admin: ParticipantMember[];
  bouncer: ParticipantMember[];
  usher: ParticipantMember[];
  marketer: ParticipantMember[];
};
type QueryErrorWithStatus = Error & {
  status?: number;
  currentUserRole?: string | null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const toIsoDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
};

const retryUnlessForbidden = (failureCount: number, error: unknown) => {
  const status = (error as QueryErrorWithStatus)?.status;
  if (status === 403) return false;
  return failureCount < 2;
};

const combineRegimeDateTime = (
  dateValue?: string | null,
  timeValue?: string | null,
) => {
  if (!dateValue || !timeValue) return null;
  const datePart = dateValue.slice(0, 10);
  const timePart = timeValue.slice(0, 8);
  const combined = new Date(`${datePart}T${timePart}`);
  if (Number.isNaN(combined.getTime())) return null;
  return combined;
};

const resolveAccessRole = (
  role?: string | null,
): "creator" | "super_admin" | "admin" | "bouncer" | "usher" | "marketer" => {
  const normalized = role?.toLowerCase();
  if (normalized === "super_admin") return "super_admin";
  if (normalized === "admin") return "admin";
  if (normalized === "bouncer") return "bouncer";
  if (normalized === "usher") return "usher";
  if (normalized === "marketer" || normalized === "affiliate")
    return "marketer";
  return "creator";
};

export default function OwnerRegimeDashboardPage({
  regimeId,
}: Readonly<OwnerRegimeDashboardPageProps>) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayIso = toIsoDate(today);
  const defaultFromIso = toIsoDate(addDays(today, -6));

  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("150000");
  const [transferType, setTransferType] = useState<"external" | "internal">(
    "external",
  );
  const [externalAccountNumber, setExternalAccountNumber] = useState("");
  const [externalBankName, setExternalBankName] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [internalRecipientMode, setInternalRecipientMode] = useState<
    "email" | "participant"
  >("email");
  const [internalRecipientEmail, setInternalRecipientEmail] = useState("");
  const [selectedParticipantRecipient, setSelectedParticipantRecipient] =
    useState("");
  const [selectedPricingFilter, setSelectedPricingFilter] = useState("all");
  const [weeklyRangeMode, setWeeklyRangeMode] = useState<
    "this_week" | "custom"
  >("this_week");
  const [weeklyFromDate, setWeeklyFromDate] = useState(defaultFromIso);
  const [weeklyToDate, setWeeklyToDate] = useState(todayIso);

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantRole, setParticipantRole] =
    useState<AssignableRole>("admin");
  const [participantActionError, setParticipantActionError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<{
    participantId: string;
    role: AssignableRole;
    name: string;
  } | null>(null);

  const participantsQueryKey = [
    "dashboard-participants",
    session?.accessToken,
    regimeId,
  ] as const;
  const {
    data: participantsResponse,
    isLoading: isParticipantsLoading,
    isError: isParticipantsError,
    error: participantsError,
  } = useQuery({
    queryKey: participantsQueryKey,
    queryFn: () =>
      getDashboardParticipants(session?.accessToken as string, {
        regimeId,
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const participantRoleFromError = (
    participantsError as QueryErrorWithStatus
  )?.currentUserRole;
  const resolvedRoleValue =
    participantsResponse?.data?.currentUserRole ?? participantRoleFromError;
  const isRoleResolved = Boolean(resolvedRoleValue);
  const isRoleResolutionError =
    !isParticipantsLoading && !isRoleResolved && isParticipantsError;

  const participants = useMemo<ParticipantState>(() => {
    const grouped: ParticipantState = {
      super_admin: [],
      admin: [],
      bouncer: [],
      usher: [],
      marketer: [],
    };

    for (const participant of participantsResponse?.data?.participants ?? []) {
      if (participant.participantRole in grouped) {
        grouped[participant.participantRole].push({
          id: participant.id,
          participantId: participant.participantId,
          name: participant.userName,
          email: participant.email,
          userName: participant.userName,
          participantRole: participant.participantRole,
        });
      }
    }

    return grouped;
  }, [participantsResponse]);

  const addParticipantMutation = useMutation({
    mutationFn: (payload: { email: string; participantRole: AssignableRole }) =>
      createDashboardParticipant(session?.accessToken as string, {
        regimeId,
        email: payload.email,
        participantRole: payload.participantRole,
      }),
    onSuccess: async () => {
      setParticipantEmail("");
      setParticipantActionError("");
      await queryClient.invalidateQueries({ queryKey: participantsQueryKey });
    },
    onError: (error: Error) => {
      setParticipantActionError(error.message);
    },
  });

  const updateParticipantMutation = useMutation({
    mutationFn: (payload: {
      participantId: string;
      participantRole: AssignableRole;
    }) =>
      updateDashboardParticipant(session?.accessToken as string, {
        regimeId,
        participantId: payload.participantId,
        participantRole: payload.participantRole,
      }),
    onSuccess: async () => {
      setParticipantActionError("");
      await queryClient.invalidateQueries({ queryKey: participantsQueryKey });
    },
    onError: (error: Error) => {
      setParticipantActionError(error.message);
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (payload: { participantId: string }) =>
      removeDashboardParticipant(session?.accessToken as string, {
        regimeId,
        participantId: payload.participantId,
      }),
    onSuccess: async () => {
      setParticipantActionError("");
      setPendingRemoval(null);
      await queryClient.invalidateQueries({ queryKey: participantsQueryKey });
    },
    onError: (error: Error) => {
      setParticipantActionError(error.message);
    },
  });

  const { data: regimeSearchData } = useQuery({
    queryKey: ["dashboard-pricing-options", regimeId],
    queryFn: () =>
      searchForRegimes({ searchString: regimeId, page: 1, limit: 1 }),
    enabled: !!regimeId,
    retry: retryUnlessForbidden,
  });
  const pricingOptions = useMemo(
    () => regimeSearchData?.data?.[0]?.pricings ?? [],
    [regimeSearchData],
  );
  const selectedRegime = regimeSearchData?.data?.[0];
  const effectiveRole: AccessRole = resolveAccessRole(resolvedRoleValue);
  const isCreatorOrSuper =
    effectiveRole === "creator" || effectiveRole === "super_admin";
  const isAdmin = effectiveRole === "admin";
  const isBouncerOrUsher =
    effectiveRole === "bouncer" || effectiveRole === "usher";
  const isMarketer = effectiveRole === "marketer";
  const canSeeFinancialData = isCreatorOrSuper;
  const canTransferFunds = isCreatorOrSuper;
  const canManageParticipantsByRolePreview = isCreatorOrSuper || isAdmin;
  const assignableRoles: AssignableRole[] = isCreatorOrSuper
    ? ["super_admin", "admin", "usher", "bouncer", "marketer"]
    : ["admin", "usher", "bouncer", "marketer"];
  const assignableRolesForCurrentUser = useMemo<AssignableRole[]>(
    () =>
      (participantsResponse?.data?.permissions
        ?.assignableRoles as AssignableRole[]) ?? assignableRoles,
    [participantsResponse, assignableRoles],
  );
  const canManageParticipants =
    participantsResponse?.data?.permissions?.canManageParticipants ??
    canManageParticipantsByRolePreview;
  const regimeStartAt = useMemo(
    () =>
      combineRegimeDateTime(
        selectedRegime?.start_date,
        selectedRegime?.start_time,
      ),
    [selectedRegime?.start_date, selectedRegime?.start_time],
  );
  const regimeEndAt = useMemo(
    () =>
      combineRegimeDateTime(selectedRegime?.end_date, selectedRegime?.end_time),
    [selectedRegime?.end_date, selectedRegime?.end_time],
  );
  const computedStatus = useMemo<RegimeStatus>(() => {
    if (!regimeStartAt || !regimeEndAt) return "upcoming";
    const currentTimestamp = Date.now();
    if (currentTimestamp < regimeStartAt.getTime()) return "upcoming";
    if (currentTimestamp > regimeEndAt.getTime()) return "ended";
    return "ongoing";
  }, [regimeStartAt, regimeEndAt]);
  const regimeStartDateLabel = regimeStartAt
    ? regimeStartAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "--";
  const regimeStartTimeLabel = regimeStartAt
    ? regimeStartAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "--";

  useEffect(() => {
    if (
      selectedPricingFilter !== "all" &&
      !pricingOptions.some((pricing) => pricing.id === selectedPricingFilter)
    ) {
      setSelectedPricingFilter("all");
    }
  }, [pricingOptions, selectedPricingFilter]);

  const {
    data: ticketPerformanceResponse,
    isLoading: isTicketPerformanceLoading,
    isError: isTicketPerformanceError,
    error: ticketPerformanceError,
  } = useQuery({
    queryKey: [
      "dashboard-ticket-performance",
      session?.accessToken,
      regimeId,
      selectedPricingFilter,
      weeklyFromDate,
      weeklyToDate,
    ],
    queryFn: () =>
      getDashboardTicketPerformance(session?.accessToken as string, {
        regimeId,
        pricingId:
          selectedPricingFilter === "all" ? undefined : selectedPricingFilter,
        fromDate: weeklyFromDate,
        toDate: weeklyToDate,
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });

  const soldProgress = ticketPerformanceResponse?.data?.soldProgress;
  const soldPct = Math.max(0, Math.min(100, soldProgress?.soldPercentage ?? 0));
  const pricingTotal = soldProgress?.total ?? 0;
  const pricingSold = soldProgress?.sold ?? 0;
  const pricingLeft = soldProgress?.left ?? 0;
  const currentPricingName =
    ticketPerformanceResponse?.data?.pricingName ?? "All Pricings";
  const {
    data: allTimeTicketPerformanceResponse,
    isLoading: isAllTimeTicketPerformanceLoading,
  } = useQuery({
    queryKey: [
      "dashboard-ticket-performance-all-time",
      session?.accessToken,
      regimeId,
    ],
    queryFn: () =>
      getDashboardTicketPerformance(session?.accessToken as string, {
        regimeId,
        duration: "all_time",
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const allTimeSoldTickets =
    allTimeTicketPerformanceResponse?.data?.soldProgress?.sold ?? 0;
  const allTimeTicketsLeft =
    allTimeTicketPerformanceResponse?.data?.soldProgress?.left ?? 0;
  const {
    data: dashboardTransactionsResponse,
    isLoading: isDashboardTransactionsLoading,
    isError: isDashboardTransactionsError,
    error: dashboardTransactionsError,
  } = useQuery({
    queryKey: ["dashboard-transactions", session?.accessToken, regimeId, 1, 20],
    queryFn: () =>
      getDashboardTransactions(session?.accessToken as string, {
        regimeId,
        duration: "all_time",
        page: 1,
        limit: 20,
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const transactionSummary = dashboardTransactionsResponse?.data?.summary;
  const totalTransactions = transactionSummary?.totalTransactions ?? 0;
  const dashboardTransactions: TransactionItem[] =
    dashboardTransactionsResponse?.data?.transactions.map((txn) => ({
      id: txn.id,
      createdAt: txn.createdAt,
      type: txn.type,
      actor: {
        name: txn.actor.name || txn.actor.email || "Unknown",
        email: txn.actor.email || "",
      },
      amount: txn.amount,
      actualAmount: txn.actualAmount,
      companyCharge: txn.companyCharge,
      paymentGatewayCharge: txn.paymentGatewayCharge,
      affiliateAmount: txn.affiliateAmount,
      paymentGateway: txn.paymentGateway,
      note:
        txn.description ||
        (txn.type === "ticket_sale"
          ? "Ticket sale transaction"
          : "Regime transfer debit"),
    })) ?? [];
  const {
    data: attendanceSummaryResponse,
    isLoading: isAttendanceSummaryLoading,
    isError: isAttendanceSummaryError,
    error: attendanceSummaryError,
  } = useQuery({
    queryKey: ["dashboard-attendance-summary", session?.accessToken, regimeId],
    queryFn: () =>
      getDashboardAttendanceList(session?.accessToken as string, {
        regimeId,
        page: 1,
        limit: 1,
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const { data: presentPreviewResponse } = useQuery({
    queryKey: [
      "dashboard-attendance-preview",
      "present",
      session?.accessToken,
      regimeId,
    ],
    queryFn: () =>
      getDashboardAttendanceList(session?.accessToken as string, {
        regimeId,
        page: 1,
        limit: 3,
        filters: ["present"],
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const { data: steppedOutPreviewResponse } = useQuery({
    queryKey: [
      "dashboard-attendance-preview",
      "stepped-out",
      session?.accessToken,
      regimeId,
    ],
    queryFn: () =>
      getDashboardAttendanceList(session?.accessToken as string, {
        regimeId,
        page: 1,
        limit: 3,
        filters: ["stepped-out"],
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const { data: yetToAttendPreviewResponse } = useQuery({
    queryKey: [
      "dashboard-attendance-preview",
      "yet-to-attend",
      session?.accessToken,
      regimeId,
    ],
    queryFn: () =>
      getDashboardAttendanceList(session?.accessToken as string, {
        regimeId,
        page: 1,
        limit: 3,
        filters: ["yet-to-attend"],
      }),
    enabled: !!session?.accessToken && !!regimeId,
    retry: retryUnlessForbidden,
  });
  const attendanceSummary = attendanceSummaryResponse?.summary;
  const presentCount = attendanceSummary?.present ?? 0;
  const steppedOutCount = attendanceSummary?.steppedOut ?? 0;
  const yetToAttendCount = attendanceSummary?.yetToAttend ?? 0;
  const presentPreviewNames =
    presentPreviewResponse?.data
      ?.map((item) => item.userName)
      .filter(Boolean) ?? [];
  const steppedOutPreviewNames =
    steppedOutPreviewResponse?.data
      ?.map((item) => item.userName)
      .filter(Boolean) ?? [];
  const yetToAttendPreviewNames =
    yetToAttendPreviewResponse?.data
      ?.map((item) => item.userName)
      .filter(Boolean) ?? [];
  const totalParticipantCount =
    participantsResponse?.data?.summary?.total ??
    participants.super_admin.length +
      participants.admin.length +
      participants.bouncer.length +
      participants.usher.length +
      participants.marketer.length;
  const participantRecipientOptions = useMemo(() => {
    const grouped: Array<{
      role: AssignableRole;
      members: ParticipantMember[];
    }> = [
      { role: "super_admin", members: participants.super_admin },
      { role: "admin", members: participants.admin },
      { role: "usher", members: participants.usher },
      { role: "bouncer", members: participants.bouncer },
      { role: "marketer", members: participants.marketer },
    ];

    return grouped.flatMap((group) =>
      group.members.map((member) => ({
        value: `${group.role}:${member.participantId}`,
        label: `${member.name || member.email} (${group.role})`,
      })),
    );
  }, [participants]);

  const statusTone =
    computedStatus === "ongoing"
      ? "bg-emerald-100 text-emerald-700"
      : computedStatus === "upcoming"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  const weeklyRangeChartData = useMemo(() => {
    const apiPoints = ticketPerformanceResponse?.data?.weeklyTicketSales ?? [];
    if (apiPoints.length > 0) {
      return apiPoints.map((item) => ({
        key: item.date,
        day: item.day,
        sold: item.sold,
      }));
    }

    const from = parseIsoDate(weeklyFromDate);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(from, index);
      return {
        key: toIsoDate(date),
        day: DAY_LABELS[date.getDay()],
        sold: 0,
      };
    });
  }, [ticketPerformanceResponse, weeklyFromDate]);
  const maxWeeklyRangeSales = Math.max(
    ...weeklyRangeChartData.map((item) => item.sold),
    1,
  );

  const resolveAccountName = async (
    accountNumber: string,
    bankName: string,
  ): Promise<string> => {
    // Placeholder for real account-resolution API integration.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `${bankName.toUpperCase()} USER`;
  };

  const handleAddParticipant = () => {
    const email = participantEmail.trim();
    if (!email) return;

    if (!assignableRolesForCurrentUser.includes(participantRole)) {
      setParticipantActionError("You cannot assign this role.");
      return;
    }

    addParticipantMutation.mutate({
      email,
      participantRole,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4FBFA] via-white to-white">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">Regime Dashboard</p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {selectedRegime?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
            {isRoleResolved ? (
              <span className="px-3 py-1 text-xs rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wide">
                {effectiveRole.replace("_", " ")}
              </span>
            ) : (
              <span className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
            )}
            <span
              className={`px-3 py-1 text-sm rounded-full font-semibold ${statusTone}`}
            >
              {computedStatus}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {!isRoleResolved ? (
          isRoleResolutionError ? (
            <section className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm text-rose-700">
              {participantsError instanceof Error
                ? participantsError.message
                : "Unable to resolve your dashboard role."}
            </section>
          ) : (
            <DashboardRoleSkeleton />
          )
        ) : (
          <>
        {(isCreatorOrSuper || isAdmin || isMarketer) && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canSeeFinancialData && (
              <StatCard
                title="Net Amount Made"
                value={`₦${Number(regimeSearchData?.data?.[0]?.balance || 0).toLocaleString()}`}
                icon={<CircleDollarSign className="w-5 h-5" />}
                hint={`Gross: ₦${Number(regimeSearchData?.data?.[0]?.total_revenue || 0).toLocaleString()}`}
              />
            )}

            <StatCard
              title="Tickets Sold"
              value={
                isAllTimeTicketPerformanceLoading
                  ? "..."
                  : `${allTimeSoldTickets}`
              }
              icon={<Ticket className="w-5 h-5" />}
              hint={`${allTimeTicketsLeft} left`}
            />

            {!isMarketer && (
              <StatCard
                title="Total Transactions"
                value={
                  isDashboardTransactionsLoading
                    ? "..."
                    : `${totalTransactions}`
                }
                icon={<ReceiptText className="w-5 h-5" />}
                hint="Sales + transfer debits"
              />
            )}

            {!isMarketer && (
              <StatCard
                title="Participants"
                value={`${totalParticipantCount}`}
                icon={<Users className="w-5 h-5" />}
                hint="All assigned roles"
              />
            )}
          </section>
        )}

        {(isCreatorOrSuper || isAdmin || isMarketer) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Ticket Performance</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing: {currentPricingName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 w-full sm:w-auto">
                  <select
                    value={selectedPricingFilter}
                    onChange={(e) => setSelectedPricingFilter(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white w-full sm:w-auto"
                  >
                    <option value="all">All Pricings</option>
                    {pricingOptions.map((pricing) => (
                      <option key={pricing.id} value={pricing.id}>
                        {pricing.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{regimeStartDateLabel}</span>
                    <Clock3 className="w-4 h-4 ml-2" />
                    <span>{regimeStartTimeLabel}</span>
                  </div>
                </div>
              </div>

              {isTicketPerformanceError && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {ticketPerformanceError instanceof Error
                    ? ticketPerformanceError.message
                    : "Failed to load ticket performance."}
                </div>
              )}

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Sold Progress</span>
                <span className="text-sm font-medium text-gray-800">
                  {isTicketPerformanceLoading ? "..." : `${soldPct}%`}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0F766E] to-[#22C55E]"
                  style={{ width: `${soldPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <MiniCell label="Total" value={`${pricingTotal}`} />
                <MiniCell label="Sold" value={`${pricingSold}`} />
                <MiniCell label="Left" value={`${pricingLeft}`} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Weekly Ticket Sales
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1">
                      <button
                        onClick={() => {
                          setWeeklyRangeMode("this_week");
                          setWeeklyFromDate(defaultFromIso);
                          setWeeklyToDate(todayIso);
                        }}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          weeklyRangeMode === "this_week"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        onClick={() => setWeeklyRangeMode("custom")}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          weeklyRangeMode === "custom"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>
                {weeklyRangeMode === "custom" && (
                  <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">From</label>
                      <input
                        type="date"
                        max={todayIso}
                        value={weeklyFromDate}
                        onChange={(e) => {
                          const nextFrom = parseIsoDate(e.target.value);
                          const adjustedTo = addDays(nextFrom, 6);
                          const finalTo =
                            adjustedTo > today ? today : adjustedTo;
                          const finalFrom = addDays(finalTo, -6);
                          setWeeklyFromDate(toIsoDate(finalFrom));
                          setWeeklyToDate(toIsoDate(finalTo));
                        }}
                        className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border border-gray-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">To</label>
                      <input
                        type="date"
                        max={todayIso}
                        value={weeklyToDate}
                        onChange={(e) => {
                          const nextTo = parseIsoDate(e.target.value);
                          const finalTo = nextTo > today ? today : nextTo;
                          const finalFrom = addDays(finalTo, -6);
                          setWeeklyFromDate(toIsoDate(finalFrom));
                          setWeeklyToDate(toIsoDate(finalTo));
                        }}
                        className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border border-gray-300 bg-white"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mb-2">
                  Range: {weeklyFromDate} to {weeklyToDate} (7 days)
                </p>
                <div className="rounded-xl border border-gray-100 p-3">
                  <div className="grid grid-cols-7 gap-2 items-end h-28">
                    {weeklyRangeChartData.map((item) => (
                      <div
                        key={item.key}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-full h-20 flex items-end">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-[#0F766E] to-[#22C55E]"
                            style={{
                              height: `${Math.max(
                                10,
                                Math.round(
                                  (item.sold / maxWeeklyRangeSales) * 100,
                                ),
                              )}%`,
                            }}
                            title={`${item.sold} sold (${currentPricingName})`}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!isMarketer && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Transfer Funds</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Transfer earnings externally or internally to a user.
                </p>
                {canTransferFunds ? (
                  <>
                    <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1 mb-3 w-full">
                      <button
                        onClick={() => setTransferType("external")}
                        className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          transferType === "external"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        External
                      </button>
                      <button
                        onClick={() => setTransferType("internal")}
                        className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          transferType === "internal"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Internal
                      </button>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                    />

                    {transferType === "external" ? (
                      <>
                        <label className="text-sm font-medium text-gray-700">
                          Account Number
                        </label>
                        <input
                          value={externalAccountNumber}
                          onChange={(e) => {
                            setExternalAccountNumber(e.target.value);
                            setResolvedAccountName("");
                          }}
                          placeholder="Enter account number"
                          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Bank Name
                        </label>
                        <input
                          value={externalBankName}
                          onChange={(e) => {
                            setExternalBankName(e.target.value);
                            setResolvedAccountName("");
                          }}
                          placeholder="Enter bank name"
                          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                        />
                        <button
                          type="button"
                          disabled={
                            isResolvingAccount ||
                            externalAccountNumber.trim().length < 10 ||
                            !externalBankName.trim()
                          }
                          onClick={async () => {
                            setIsResolvingAccount(true);
                            const accountName = await resolveAccountName(
                              externalAccountNumber.trim(),
                              externalBankName.trim(),
                            );
                            setResolvedAccountName(accountName);
                            setIsResolvingAccount(false);
                          }}
                          className="w-full mb-3 px-3 py-2 rounded-lg border border-[#0F766E] text-[#0F766E] disabled:opacity-50"
                        >
                          {isResolvingAccount
                            ? "Resolving account..."
                            : "Resolve Account Name"}
                        </button>
                        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                          <p className="text-xs text-gray-500">Account Name</p>
                          <p className="text-sm font-medium text-gray-800">
                            {resolvedAccountName || "Not resolved yet"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1 mb-3 w-full">
                          <button
                            onClick={() => setInternalRecipientMode("email")}
                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              internalRecipientMode === "email"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            By Email
                          </button>
                          <button
                            onClick={() =>
                              setInternalRecipientMode("participant")
                            }
                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              internalRecipientMode === "participant"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            From Participants
                          </button>
                        </div>

                        {internalRecipientMode === "email" ? (
                          <>
                            <label className="text-sm font-medium text-gray-700">
                              Recipient Email
                            </label>
                            <input
                              type="email"
                              value={internalRecipientEmail}
                              onChange={(e) =>
                                setInternalRecipientEmail(e.target.value)
                              }
                              placeholder="Enter recipient email"
                              className="w-full mt-1 mb-4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                            />
                          </>
                        ) : (
                          <>
                            <label className="text-sm font-medium text-gray-700">
                              Select Participant
                            </label>
                            <select
                              value={selectedParticipantRecipient}
                              onChange={(e) =>
                                setSelectedParticipantRecipient(e.target.value)
                              }
                              className="w-full mt-1 mb-4 px-3 py-2 rounded-lg border border-gray-300 bg-white"
                            >
                              <option value="">Choose participant</option>
                              {participantRecipientOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </>
                    )}

                    <button className="w-full flex items-center justify-center gap-2 bg-[#0F766E] text-white py-2.5 rounded-lg hover:bg-[#0D665F] transition-colors">
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>
                        {transferType === "external" ? "Transfer" : "Send"} ₦
                        {Number(payoutAmount || 0).toLocaleString()}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    You do not have permission to transfer funds.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {(isCreatorOrSuper || isAdmin) && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-lg font-semibold">Regime Participants</h2>
              {canManageParticipants && (
                <button
                  onClick={() => setShowAddParticipant((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 text-sm bg-[#0F766E] text-white px-3 py-2 rounded-lg hover:bg-[#0D665F] transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {showAddParticipant ? "Close" : "Add Participant"}
                  </span>
                </button>
              )}
            </div>

            {showAddParticipant && canManageParticipants && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="Participant email"
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                  />
                  <select
                    value={participantRole}
                    onChange={(e) =>
                      setParticipantRole(e.target.value as AssignableRole)
                    }
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {assignableRolesForCurrentUser.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddParticipant}
                    disabled={addParticipantMutation.isPending}
                    className="bg-white border border-[#0F766E] text-[#0F766E] px-3 py-2 rounded-lg hover:bg-[#0F766E]/5 transition-colors"
                  >
                    {addParticipantMutation.isPending
                      ? "Saving..."
                      : "Save Participant"}
                  </button>
                </div>
                {participantActionError && (
                  <p className="text-sm text-rose-600 mt-2">
                    {participantActionError}
                  </p>
                )}
              </div>
            )}

            {pendingRemoval && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-sm text-rose-700">
                  Remove{" "}
                  <span className="font-semibold">{pendingRemoval.name}</span>{" "}
                  from {pendingRemoval.role}s?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPendingRemoval(null)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      removeParticipantMutation.mutate({
                        participantId: pendingRemoval.participantId,
                      });
                    }}
                    disabled={removeParticipantMutation.isPending}
                    className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    {removeParticipantMutation.isPending
                      ? "Removing..."
                      : "Confirm Remove"}
                  </button>
                </div>
              </div>
            )}

            {isParticipantsError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {participantsError instanceof Error
                  ? participantsError.message
                  : "Failed to load participants."}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RoleCard
                role="Super Admins"
                roleKey="super_admin"
                members={participants.super_admin}
                canManage={
                  canManageParticipants &&
                  assignableRolesForCurrentUser.includes("super_admin")
                }
                assignableRoles={assignableRolesForCurrentUser}
                onRemove={(member) =>
                  setPendingRemoval({
                    participantId: member.participantId,
                    role: "super_admin",
                    name: member.name || member.email,
                  })
                }
                onUpdateRole={(member, nextRole) =>
                  updateParticipantMutation.mutate({
                    participantId: member.participantId,
                    participantRole: nextRole,
                  })
                }
                isUpdating={updateParticipantMutation.isPending}
              />
              <RoleCard
                role="Admins"
                roleKey="admin"
                members={participants.admin}
                canManage={
                  canManageParticipants &&
                  assignableRolesForCurrentUser.includes("admin")
                }
                assignableRoles={assignableRolesForCurrentUser}
                onRemove={(member) =>
                  setPendingRemoval({
                    participantId: member.participantId,
                    role: "admin",
                    name: member.name || member.email,
                  })
                }
                onUpdateRole={(member, nextRole) =>
                  updateParticipantMutation.mutate({
                    participantId: member.participantId,
                    participantRole: nextRole,
                  })
                }
                isUpdating={updateParticipantMutation.isPending}
              />
              <RoleCard
                role="Bouncers"
                roleKey="bouncer"
                members={participants.bouncer}
                canManage={
                  canManageParticipants &&
                  assignableRolesForCurrentUser.includes("bouncer")
                }
                assignableRoles={assignableRolesForCurrentUser}
                onRemove={(member) =>
                  setPendingRemoval({
                    participantId: member.participantId,
                    role: "bouncer",
                    name: member.name || member.email,
                  })
                }
                onUpdateRole={(member, nextRole) =>
                  updateParticipantMutation.mutate({
                    participantId: member.participantId,
                    participantRole: nextRole,
                  })
                }
                isUpdating={updateParticipantMutation.isPending}
              />
              <RoleCard
                role="Ushers"
                roleKey="usher"
                members={participants.usher}
                canManage={
                  canManageParticipants &&
                  assignableRolesForCurrentUser.includes("usher")
                }
                assignableRoles={assignableRolesForCurrentUser}
                onRemove={(member) =>
                  setPendingRemoval({
                    participantId: member.participantId,
                    role: "usher",
                    name: member.name || member.email,
                  })
                }
                onUpdateRole={(member, nextRole) =>
                  updateParticipantMutation.mutate({
                    participantId: member.participantId,
                    participantRole: nextRole,
                  })
                }
                isUpdating={updateParticipantMutation.isPending}
              />
              <RoleCard
                role="Marketers"
                roleKey="marketer"
                members={participants.marketer}
                canManage={
                  canManageParticipants &&
                  assignableRolesForCurrentUser.includes("marketer")
                }
                assignableRoles={assignableRolesForCurrentUser}
                onRemove={(member) =>
                  setPendingRemoval({
                    participantId: member.participantId,
                    role: "marketer",
                    name: member.name || member.email,
                  })
                }
                onUpdateRole={(member, nextRole) =>
                  updateParticipantMutation.mutate({
                    participantId: member.participantId,
                    participantRole: nextRole,
                  })
                }
                isUpdating={updateParticipantMutation.isPending}
              />
            </div>
            {isParticipantsLoading && (
              <p className="text-sm text-gray-500 mt-3">
                Loading participants...
              </p>
            )}
          </section>
        )}

        {/* Attendance section */}
        {
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <button
              onClick={() => setShowAttendanceDetails((prev) => !prev)}
              className="w-full flex items-start sm:items-center justify-between text-left gap-3"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Venue Attendance Monitor
                </h2>
                <p className="text-sm text-gray-600">
                  Track checked-in guests, step-outs, and pending attendance.
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  showAttendanceDetails ? "rotate-180" : ""
                }`}
              />
            </button>

            {/** {computedStatus === "upcoming" ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Attendance metrics will be available after event check-in
                starts.
              </div>
            ) : ( **/}
            {/* showAttendanceDetails && ( */}
            <div className="mt-4 space-y-3">
              {isAttendanceSummaryError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {attendanceSummaryError instanceof Error
                    ? attendanceSummaryError.message
                    : "Failed to load attendance summary."}
                </div>
              )}
              {isAttendanceSummaryLoading && (
                <p className="text-sm text-gray-500">
                  Loading attendance data...
                </p>
              )}
              <div className="grid lg:grid-cols-3 gap-4">
                <AttendanceCard
                  label={`Present (${presentCount})`}
                  names={presentPreviewNames}
                  tone="text-emerald-700 bg-emerald-50 border-emerald-200"
                  href={`/regimes/${regimeId}/attendance?filter=present`}
                />
                <AttendanceCard
                  label={`Stepped Out (${steppedOutCount})`}
                  names={steppedOutPreviewNames}
                  tone="text-amber-700 bg-amber-50 border-amber-200"
                  href={`/regimes/${regimeId}/attendance?filter=stepped-out`}
                />
                <AttendanceCard
                  label={`Yet To Attend (${yetToAttendCount})`}
                  names={yetToAttendPreviewNames}
                  tone="text-slate-700 bg-slate-50 border-slate-200"
                  href={`/regimes/${regimeId}/attendance?filter=yet-to-attend`}
                />
              </div>
            </div>
            {/* ) */}
            {/** )} **/}
          </section>
        }

        {canSeeFinancialData && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-1">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <span className="text-xs text-gray-500">Regime: {regimeId}</span>
            </div>
            {isDashboardTransactionsError && (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {dashboardTransactionsError instanceof Error
                  ? dashboardTransactionsError.message
                  : "Failed to fetch dashboard transactions."}
              </div>
            )}
            {isDashboardTransactionsLoading && (
              <p className="text-sm text-gray-500 mb-3">
                Loading transactions...
              </p>
            )}
            <div className="space-y-3">
              {dashboardTransactions.map((txn) => {
                const isSale = txn.type === "ticket_sale";
                return (
                  <div
                    key={txn.id}
                    className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{txn.note}</p>
                      <p className="text-sm text-gray-500">
                        {txn.id} •{" "}
                        {new Date(txn.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        • {txn.actor.name}
                        {txn.actor.email ? ` (${txn.actor.email})` : ""}
                      </p>
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>
                          Actual Amount:{" "}
                          <span className="font-semibold text-gray-800">
                            ₦{txn.actualAmount.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Amount:{" "}
                          <span className="font-semibold text-gray-800">
                            ₦{txn.amount.toLocaleString()}
                          </span>
                        </p>
                        {isSale && (
                          <>
                            <p>
                              Affiliate Amount:{" "}
                              <span className="font-semibold text-gray-800">
                                ₦
                                {Number(
                                  txn.affiliateAmount ?? 0,
                                ).toLocaleString()}
                              </span>
                            </p>
                            <p>
                              Company Charge:{" "}
                              <span className="font-semibold text-gray-800">
                                ₦
                                {Number(
                                  txn.companyCharge ?? 0,
                                ).toLocaleString()}
                              </span>
                            </p>
                            <p>
                              Payment Gateway Charge:{" "}
                              <span className="font-semibold text-gray-800">
                                ₦
                                {Number(
                                  txn.paymentGatewayCharge ?? 0,
                                ).toLocaleString()}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isSale ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isSale ? "+" : "-"}₦
                        {Math.abs(txn.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {txn.paymentGateway ||
                          (isSale ? "Ticket Sale" : "Transfer Debit")}
                      </p>
                    </div>
                  </div>
                );
              })}
              {!isDashboardTransactionsLoading &&
                dashboardTransactions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No transactions found.
                  </p>
                )}
            </div>
          </section>
        )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="text-[#0F766E]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  );
}

function MiniCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DashboardRoleSkeleton() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionSkeleton key={`stats-${index}`} className="h-28" />
        ))}
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionSkeleton className="h-[420px] lg:col-span-2" />
        <SectionSkeleton className="h-[420px]" />
      </section>
      <SectionSkeleton className="h-[300px]" />
      <SectionSkeleton className="h-[220px]" />
      <SectionSkeleton className="h-[320px]" />
    </>
  );
}

function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${
        className ?? ""
      }`}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function RoleCard({
  role,
  roleKey,
  members,
  canManage,
  assignableRoles,
  onRemove,
  onUpdateRole,
  isUpdating,
}: {
  role: string;
  roleKey: AssignableRole;
  members: ParticipantMember[];
  canManage: boolean;
  assignableRoles: AssignableRole[];
  onRemove: (member: ParticipantMember) => void;
  onUpdateRole: (member: ParticipantMember, nextRole: AssignableRole) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="font-medium text-gray-800 mb-3">{role}</p>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={`${roleKey}-${member.participantId}`}
            className="flex flex-col gap-2 rounded-lg border border-gray-100 p-2 text-sm text-gray-600"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                <span className="truncate">{member.name || member.email}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => onRemove(member)}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"
                  title={`Remove ${member.name || member.email}`}
                  disabled={isUpdating}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs">Remove</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate">
                {member.email || member.userName}
              </span>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 px-2 py-1 rounded-md border border-gray-300 bg-white text-xs"
                  value={member.participantRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as AssignableRole;
                    if (nextRole === member.participantRole) return;
                    onUpdateRole(member, nextRole);
                  }}
                  disabled={isUpdating}
                >
                  {assignableRoles.map((assignableRole) => (
                    <option key={assignableRole} value={assignableRole}>
                      {assignableRole}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-gray-400">No participants in this role.</p>
        )}
      </div>
    </div>
  );
}

function AttendanceCard({
  label,
  names,
  tone,
  href,
}: {
  label: string;
  names: string[];
  tone: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div
        className={`rounded-xl border p-4 ${tone} hover:opacity-90 transition-opacity`}
      >
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          {names.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
      </div>
    </Link>
  );
}
