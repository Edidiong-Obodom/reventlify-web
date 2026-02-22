"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  dashboardAttendanceAction,
  DashboardAttendanceFilter,
  getDashboardAttendanceList,
  searchDashboardAttendance,
} from "@/lib/api/dashboard";

interface AttendanceManagementPageProps {
  regimeId: string;
  initialFilter?: string;
}

type AttendanceStatusKey = "present" | "stepped-out" | "yet-to-attend";

type AttendanceRow = {
  id: string;
  name: string;
  email: string;
  ticketId: string;
  pricingName: string;
  status: AttendanceStatusKey;
  lastAction: string;
};

const PAGE_SIZE = 30;

const STATUS_META: Record<
  AttendanceStatusKey,
  { title: string; tone: string; activeTone: string }
> = {
  present: {
    title: "Present",
    tone: "bg-emerald-100 text-emerald-700",
    activeTone: "bg-emerald-200 text-emerald-800",
  },
  "stepped-out": {
    title: "Stepped Out",
    tone: "bg-amber-100 text-amber-700",
    activeTone: "bg-amber-200 text-amber-800",
  },
  "yet-to-attend": {
    title: "Yet To Attend",
    tone: "bg-slate-100 text-slate-700",
    activeTone: "bg-slate-200 text-slate-800",
  },
};

function toStatusKey(input?: string): AttendanceStatusKey {
  if (input === "present") return "present";
  if (input === "stepped-out") return "stepped-out";
  return "yet-to-attend";
}

const ALL_STATUSES: AttendanceStatusKey[] = [
  "present",
  "stepped-out",
  "yet-to-attend",
];

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): {
    detect: (
      source: HTMLVideoElement,
    ) => Promise<Array<{ rawValue?: string }>>;
  };
};

const parseScannedTicketPayload = (raw: string) => {
  const normalized = raw.trim();
  if (!normalized) return null;

  // New format: timestamp:ticketId. Keep legacy support for raw ticketId.
  const parts = normalized.split(":");
  if (parts.length < 2) {
    return { ticketId: normalized, timestamp: null as number | null };
  }

  const timestamp = Number(parts[0]);
  const ticketId = parts.slice(1).join(":").trim();
  if (!ticketId) return null;

  return {
    ticketId,
    timestamp: Number.isFinite(timestamp) ? timestamp : null,
  };
};

export default function AttendanceManagementPage({
  regimeId,
  initialFilter,
}: Readonly<AttendanceManagementPageProps>) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeFilters, setActiveFilters] = useState<AttendanceStatusKey[]>(
    initialFilter ? [toStatusKey(initialFilter)] : ALL_STATUSES,
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const detectorRef = useRef<InstanceType<BarcodeDetectorCtor> | null>(null);
  const lastScannedRef = useRef<{ rawValue: string; at: number } | null>(null);

  useEffect(() => {
    setActiveFilters(initialFilter ? [toStatusKey(initialFilter)] : ALL_STATUSES);
    setCurrentPage(1);
  }, [initialFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeFilters]);

  const filtersParam = useMemo(
    () => activeFilters as DashboardAttendanceFilter[],
    [activeFilters],
  );

  const {
    data: attendanceResponse,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    error: attendanceError,
  } = useQuery({
    queryKey: [
      "dashboard-attendance",
      session?.accessToken,
      regimeId,
      currentPage,
      PAGE_SIZE,
      filtersParam.join(","),
      debouncedSearch,
    ],
    queryFn: () => {
      if (debouncedSearch.trim()) {
        return searchDashboardAttendance(session?.accessToken as string, {
          regimeId,
          query: debouncedSearch.trim(),
          page: currentPage,
          limit: PAGE_SIZE,
          filters: filtersParam,
        });
      }
      return getDashboardAttendanceList(session?.accessToken as string, {
        regimeId,
        page: currentPage,
        limit: PAGE_SIZE,
        filters: filtersParam,
      });
    },
    enabled: !!session?.accessToken && !!regimeId,
  });

  const attendanceActionMutation = useMutation({
    mutationFn: (payload: { scannedData: string; action: "check_in" | "step_out" }) =>
      dashboardAttendanceAction(session?.accessToken as string, {
        regimeId,
        scannedData: payload.scannedData,
        action: payload.action,
      }),
    onSuccess: async (response) => {
      toast.success(response.message);
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-attendance", session?.accessToken, regimeId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = useMemo<AttendanceRow[]>(
    () =>
      attendanceResponse?.data?.map((item) => ({
        id: item.ticketId,
        name: item.userName || "Unknown",
        email: item.email || "No email",
        ticketId: item.ticketId,
        pricingName: item.pricingName,
        status: item.status,
        lastAction: item.lastAction,
      })) ?? [],
    [attendanceResponse],
  );

  const summary = attendanceResponse?.summary ?? {
    present: 0,
    steppedOut: 0,
    yetToAttend: 0,
  };

  const stopScanner = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleTicketScan = (rawPayload: string) => {
    const parsed = parseScannedTicketPayload(rawPayload);
    if (!parsed) return;

    const now = Date.now();
    const last = lastScannedRef.current;
    if (last && last.rawValue === rawPayload && now - last.at < 2000) {
      return;
    }
    lastScannedRef.current = { rawValue: rawPayload, at: now };

    if (attendanceActionMutation.isPending) {
      return;
    }

    attendanceActionMutation.mutate(
      {
        scannedData: rawPayload,
        action: "check_in",
      },
      {
        onSuccess: () => {
          setActiveFilters((prev) =>
            prev.includes("present") ? prev : [...prev, "present"],
          );
          setCurrentPage(1);
        },
      },
    );
  };

  const startScanner = async () => {
    if (!isScannerOpen) return;

    setIsStartingScanner(true);
    setScanError(null);

    try {
      const BarcodeDetectorClass = (window as any)
        .BarcodeDetector as BarcodeDetectorCtor | undefined;

      if (!BarcodeDetectorClass) {
        throw new Error("QR scanner is not supported on this browser.");
      }

      detectorRef.current = new BarcodeDetectorClass({ formats: ["qr_code"] });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const scanLoop = async () => {
        if (!videoRef.current || !detectorRef.current) return;

        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          const rawValue = codes.find((code) => code.rawValue)?.rawValue;
          if (rawValue) {
            handleTicketScan(rawValue);
          }
        } catch {
          // Ignore per-frame decode errors.
        }

        rafIdRef.current = requestAnimationFrame(scanLoop);
      };

      rafIdRef.current = requestAnimationFrame(scanLoop);
    } catch (error: any) {
      setScanError(error?.message ?? "Unable to access camera.");
    } finally {
      setIsStartingScanner(false);
    }
  };

  useEffect(() => {
    if (isScannerOpen) {
      void startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen]);

  const allActive = activeFilters.length === ALL_STATUSES.length;
  const selectedLabel =
    activeFilters.length === 1
      ? STATUS_META[activeFilters[0]].title
      : allActive
        ? "All"
        : "Selected";

  const safePage = attendanceResponse?.page ?? currentPage;
  const pageCount = attendanceResponse?.totalPages ?? 1;

  const countByStatus = (status: AttendanceStatusKey) => {
    if (status === "present") return summary.present;
    if (status === "stepped-out") return summary.steppedOut;
    return summary.yetToAttend;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/regimes/${regimeId}/dashboard`}
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">Attendance Manager</p>
              <h1 className="text-xl font-bold text-gray-900">Venue Attendance</h1>
            </div>
          </div>
          <span className="self-start sm:self-auto text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {attendanceResponse?.total ?? 0} attendees
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-4 py-2 rounded-lg hover:bg-[#0D665F] transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Check In Attendee</span>
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="p-4 border-b border-gray-100 space-y-4">
            <div className="overflow-x-auto">
              <div className="inline-flex min-w-max rounded-full bg-gray-100 p-1 gap-1">
                <button
                  onClick={() => {
                    setActiveFilters(ALL_STATUSES);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    allActive
                      ? "bg-gray-200 text-gray-800"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  All ({summary.present + summary.steppedOut + summary.yetToAttend})
                </button>
                {(Object.keys(STATUS_META) as AttendanceStatusKey[]).map((status) => {
                  const meta = STATUS_META[status];
                  const isActive = activeFilters.includes(status);
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveFilters((prev) => {
                          const next = prev.includes(status)
                            ? prev.filter((item) => item !== status)
                            : [...prev, status];
                          return next.length === 0 ? ALL_STATUSES : next;
                        });
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isActive ? meta.activeTone : "text-gray-600 hover:bg-white"
                      }`}
                    >
                      {meta.title} ({countByStatus(status)})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${selectedLabel.toLowerCase()} attendees`}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
              />
            </div>

            {isAttendanceError && (
              <p className="text-sm text-rose-600">
                {attendanceError instanceof Error
                  ? attendanceError.message
                  : "Failed to load attendance."}
              </p>
            )}
            {isAttendanceLoading && (
              <p className="text-sm text-gray-500">Loading attendance...</p>
            )}
          </div>

          <div className="block md:hidden p-3 space-y-3">
            {rows.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No attendees found.
              </div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">{row.name}</p>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full whitespace-nowrap ${STATUS_META[row.status].tone}`}
                    >
                      {STATUS_META[row.status].title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{row.email}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                    {row.ticketId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{row.pricingName}</p>
                  <p className="text-xs text-gray-500 mt-2">{row.lastAction}</p>
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        attendanceActionMutation.mutate({
                          scannedData: `${Date.now()}:${row.ticketId}`,
                          action: row.status === "present" ? "step_out" : "check_in",
                        })
                      }
                      disabled={attendanceActionMutation.isPending}
                      className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      {row.status === "present" ? "Mark Stepped Out" : "Check In"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Ticket ID</th>
                  <th className="px-4 py-3 font-medium">Pricing</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last Action</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                      No attendees found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 text-sm">
                      <td className="px-4 py-3 text-gray-900 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-gray-600">{row.email}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{row.ticketId}</td>
                      <td className="px-4 py-3 text-gray-600">{row.pricingName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${STATUS_META[row.status].tone}`}
                        >
                          {STATUS_META[row.status].title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.lastAction}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <button
                          onClick={() =>
                            attendanceActionMutation.mutate({
                              scannedData: `${Date.now()}:${row.ticketId}`,
                              action: row.status === "present" ? "step_out" : "check_in",
                            })
                          }
                          disabled={attendanceActionMutation.isPending}
                          className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          {row.status === "present" ? "Mark Stepped Out" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-500">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={safePage >= pageCount}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Scan Ticket QR</h2>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 border-[3px] border-white/30 m-6 rounded-lg pointer-events-none" />
              </div>

              {isStartingScanner && (
                <p className="text-sm text-gray-500 mt-3">Starting camera...</p>
              )}
              {scanError && <p className="text-sm text-red-600 mt-3">{scanError}</p>}
              <p className="text-xs text-gray-500 mt-3">
                Point camera at attendee QR code. Ticket ID will be read for quick check-in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
