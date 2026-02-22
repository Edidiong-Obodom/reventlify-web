"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Send,
  QrCode,
  // Download,
  Search,
  CalendarDays,
  X,
} from "lucide-react";
import ImageFallback from "../image-fallback";
import { Ticket } from "@/lib/interfaces/ticketInterface";
import {
  formatDate,
  formatPrice,
  formatTime,
  getStatusColor,
  getStatusText,
} from "@/utils/tickets";
import TransferTicketModal from "./modal";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";
import { getTickets, searchForTickets } from "@/lib/api/tickets";
import { useInfiniteQuery } from "@tanstack/react-query";
import { capitalizeFirst } from "@/lib";

export default function TicketListPage() {
  const { data: session } = useSession();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const limit = 10;
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "tickets",
      session?.accessToken,
      debouncedSearch,
      dateRange.start,
      dateRange.end,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (debouncedSearch.trim()) {
        return searchForTickets(
          session?.accessToken!,
          debouncedSearch,
          dateRange.start || undefined,
          dateRange.end || undefined,
          pageParam,
          limit,
        );
      } else {
        return getTickets(
          session?.accessToken!,
          pageParam,
          limit,
          dateRange.start || undefined,
          dateRange.end || undefined,
        );
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.data?.length < limit) return undefined;
      return allPages.length + 1;
    },
    enabled: !!session?.accessToken,
    initialPageParam: 1,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    console.log("data: ", data);

    const checkPageHeight = () => {
      if (
        window.innerHeight >= document.body.offsetHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    checkPageHeight();
    window.addEventListener("resize", checkPageHeight);
    return () => window.removeEventListener("resize", checkPageHeight);
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tickets: Ticket[] = data?.pages.flatMap((page) => page.data) || [];

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (
        selectedFilter !== "all" &&
        ticket.pricing.regime.status !== selectedFilter
      ) {
        return false;
      }

      return true;
    });
  }, [tickets, selectedFilter, searchTerm, dateRange]);

  const handleTransfer = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTransferModal(true);
  };

  const clearDateFilter = () => {
    setDateRange({ start: "", end: "" });
    setShowDateFilter(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/events/search"
                className="text-gray-800 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">My Tickets</h1>
            </div>
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <CalendarDays className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Search and Date Filter */}
      <div className="sticky top-[73px] z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets by event name, venue, or ticket type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
            />
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  From:
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5850EC]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5850EC]"
                />
              </div>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={clearDateFilter}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-[129px] z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: "all", label: "All Tickets", count: tickets.length },
              {
                key: "pending",
                label: "Upcoming",
                count: tickets.filter(
                  (t) => t?.pricing?.regime?.status === "pending",
                ).length,
              },
              {
                key: "ongoing",
                label: "Live",
                count: tickets.filter(
                  (t) => t?.pricing?.regime?.status === "ongoing",
                ).length,
              },
              {
                key: "ended",
                label: "Past",
                count: tickets.filter(
                  (t) => t?.pricing?.regime?.status === "ended",
                ).length,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${
                  selectedFilter === filter.key
                    ? "bg-[#5850EC] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedFilter === filter.key
                      ? "bg-white/20"
                      : "bg-gray-300"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={`loading-${i}`}
                className="h-[12rem] bg-white rounded-xl shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Failed to load tickets.
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-10 h-10 text-[#5850EC]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No tickets found</h2>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm || dateRange.start || dateRange.end
                ? "No tickets match your search criteria. Try adjusting your filters."
                : "You don't have any tickets yet. Browse events to find something interesting!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-1 lg:space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="relative h-48 md:h-auto md:w-48 flex-shrink-0">
                    <ImageFallback
                      src={ticket?.pricing?.regime?.media || "/placeholder.svg"}
                      fallbackSrc="/placeholder.svg?height=200&width=300"
                      alt={ticket?.pricing?.regime?.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          ticket?.pricing?.regime?.status,
                        )}`}
                      >
                        {getStatusText(ticket?.pricing?.regime?.status)}
                      </span>
                    </div>
                    {ticket?.is_transferred && (
                      <div className="absolute top-3 right-3">
                        {ticket.buyer_id === session?.user?.id ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Transferred
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-green-800 text-xs font-medium rounded-full">
                            Received
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1 mb-4 md:mb-0">
                        <Link
                          className="text-xl font-bold mb-2 hover:text-[#5850EC] cursor-pointer transition-colors truncate"
                          href={`/tickets/${ticket?.id}`}
                        >
                          {ticket?.pricing?.regime.name}
                        </Link>

                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(ticket?.pricing?.regime.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTime(ticket?.pricing?.regime?.start_time)}{" "}
                              - {formatTime(ticket?.pricing?.regime?.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">
                              {capitalizeFirst(ticket?.pricing?.regime?.venue)},{" "}
                              {capitalizeFirst(ticket?.pricing?.regime?.state)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>1 Ticket • {ticket?.pricing?.name}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Purchased: {formatDate(ticket?.created_at)}
                          </span>
                          <span className="text-sm font-medium text-[#5850EC]">
                            {formatPrice(ticket?.pricing?.amount) === "0"
                              ? "Free"
                              : `₦${formatPrice(ticket?.pricing?.amount)}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 md:ml-6">
                        <Link href={`/tickets/${ticket?.id}`}>
                          <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#5850EC] text-white px-4 py-2 rounded-lg hover:bg-[#6C63FF] transition-colors">
                            <QrCode className="w-4 h-4" />
                            <span>View Ticket</span>
                          </button>
                        </Link>

                        {ticket?.pricing?.regime?.status !== "ended" &&
                          !ticket?.is_transferred && (
                            <button
                              onClick={() => handleTransfer(ticket)}
                              className="w-full md:w-auto flex items-center justify-center gap-2 border border-[#5850EC] text-[#5850EC] px-4 py-2 rounded-lg hover:bg-[#5850EC]/5 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              <span>Transfer</span>
                            </button>
                          )}

                        {/* <button className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFetchingNextPage && (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={`loading-${i}`}
                className="bg-white rounded-xl h-[12rem] shadow-sm animate-pulse"
              />
            ))}
          </div>
        )}
      </main>

      {/* Transfer Modal */}
      {showTransferModal && selectedTicket && (
        <TransferTicketModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}
