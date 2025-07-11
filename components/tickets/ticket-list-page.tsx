"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Send,
  QrCode,
  Download,
  Search,
  CalendarDays,
  X,
} from "lucide-react";
import ImageFallback from "../image-fallback";

interface ApiTicket {
  id: string;
  pricing_id: string;
  owner_id: string;
  buyer_id: string;
  transaction_id: string;
  transferred: boolean;
  created_at: string;
  pricing: {
    name: string;
    amount: number;
    regime: {
      id: string;
      name: string;
      venue: string;
      address: string;
      city: string;
      state: string;
      country: string;
      type: string;
      media: string[];
      status: "pending" | "ongoing" | "ended";
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      creator: {
        id: string;
        user_name: string;
      };
    };
  };
}

// Mock API response data
const mockApiResponse = {
  message: "Tickets retrieved successfully",
  page: 1,
  limit: 10,
  total: 4,
  data: [
    {
      id: "tk_001",
      pricing_id: "prc_001",
      owner_id: "usr_002",
      buyer_id: "usr_001",
      transaction_id: "txn_001",
      transferred: true,
      created_at: "2025-07-10T10:00:00Z",
      pricing: {
        name: "VIP Access",
        amount: 20000,
        regime: {
          id: "r_01",
          name: "Tech Expo 2025",
          venue: "Eko Hotel",
          address: "Plot 1415 Adetokunbo Ademola Street",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          type: "conference",
          media: [
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          ],
          status: "pending",
          start_date: "2025-08-01",
          end_date: "2025-08-03",
          start_time: "09:00:00",
          end_time: "17:00:00",
          creator: {
            id: "usr_003",
            user_name: "organizer_guy",
          },
        },
      },
    },
    {
      id: "tk_002",
      pricing_id: "prc_002",
      owner_id: "usr_001",
      buyer_id: "usr_001",
      transaction_id: "txn_002",
      transferred: false,
      created_at: "2025-07-05T14:30:00Z",
      pricing: {
        name: "General Admission",
        amount: 10000,
        regime: {
          id: "r_02",
          name: "Creative Fest 2025",
          venue: "Landmark Centre",
          address: "Oniru, Victoria Island",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          type: "festival",
          media: [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          ],
          status: "ongoing",
          start_date: "2025-09-15",
          end_date: "2025-09-17",
          start_time: "10:00:00",
          end_time: "18:00:00",
          creator: {
            id: "usr_004",
            user_name: "festival_creator",
          },
        },
      },
    },
    {
      id: "tk_003",
      pricing_id: "prc_003",
      owner_id: "usr_001",
      buyer_id: "usr_001",
      transaction_id: "txn_003",
      transferred: false,
      created_at: "2024-12-01T16:45:00Z",
      pricing: {
        name: "Premium",
        amount: 15000,
        regime: {
          id: "r_03",
          name: "Music Concert Lagos",
          venue: "Tafawa Balewa Square",
          address: "Lagos Island",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          type: "concert",
          media: [
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          ],
          status: "ended",
          start_date: "2024-12-15",
          end_date: "2024-12-15",
          start_time: "19:00:00",
          end_time: "23:00:00",
          creator: {
            id: "usr_005",
            user_name: "music_producer",
          },
        },
      },
    },
    {
      id: "tk_004",
      pricing_id: "prc_004",
      owner_id: "usr_001",
      buyer_id: "usr_001",
      transaction_id: "txn_004",
      transferred: false,
      created_at: "2025-01-15T12:20:00Z",
      pricing: {
        name: "Early Bird",
        amount: 8000,
        regime: {
          id: "r_04",
          name: "Business Summit 2025",
          venue: "Four Points by Sheraton",
          address: "Victoria Island",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          type: "conference",
          media: [
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          ],
          status: "pending",
          start_date: "2025-03-20",
          end_date: "2025-03-22",
          start_time: "08:00:00",
          end_time: "17:00:00",
          creator: {
            id: "usr_006",
            user_name: "business_organizer",
          },
        },
      },
    },
  ] as ApiTicket[],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "ongoing":
      return "bg-green-100 text-green-800";
    case "ended":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Upcoming";
    case "ongoing":
      return "Live Now";
    case "ended":
      return "Completed";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString: string) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatPrice = (amount: number) => {
  return (amount / 100).toFixed(2); // Convert from cents to dollars
};

const TicketListPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);

  const tickets = mockApiResponse.data;

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (
        selectedFilter !== "all" &&
        ticket.pricing.regime.status !== selectedFilter
      ) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const eventName = ticket.pricing.regime.name.toLowerCase();
        const venue = ticket.pricing.regime.venue.toLowerCase();
        const ticketType = ticket.pricing.name.toLowerCase();

        if (
          !eventName.includes(searchLower) &&
          !venue.includes(searchLower) &&
          !ticketType.includes(searchLower)
        ) {
          return false;
        }
      }

      // Date range filter
      if (dateRange.start && dateRange.end) {
        const eventDate = new Date(ticket.pricing.regime.start_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        if (eventDate < startDate || eventDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, selectedFilter, searchTerm, dateRange]);

  const handleTransfer = (ticket: ApiTicket) => {
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
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                  (t) => t.pricing.regime.status === "pending"
                ).length,
              },
              {
                key: "ongoing",
                label: "Live",
                count: tickets.filter(
                  (t) => t.pricing.regime.status === "ongoing"
                ).length,
              },
              {
                key: "ended",
                label: "Past",
                count: tickets.filter(
                  (t) => t.pricing.regime.status === "ended"
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
        {filteredTickets.length === 0 ? (
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
                      src={ticket.pricing.regime.media[0] || "/placeholder.svg"}
                      fallbackSrc="/placeholder.svg?height=200&width=300"
                      alt={ticket.pricing.regime.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          ticket.pricing.regime.status
                        )}`}
                      >
                        {getStatusText(ticket.pricing.regime.status)}
                      </span>
                    </div>
                    {ticket.transferred && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Transferred
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1 mb-4 md:mb-0">
                        <Link href={`/tickets/${ticket.id}`}>
                          <h3 className="text-xl font-bold mb-2 hover:text-[#5850EC] cursor-pointer transition-colors">
                            {ticket.pricing.regime.name}
                          </h3>
                        </Link>

                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(ticket.pricing.regime.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTime(ticket.pricing.regime.start_time)} -{" "}
                              {formatTime(ticket.pricing.regime.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {ticket.pricing.regime.venue},{" "}
                              {ticket.pricing.regime.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>1 Ticket • {ticket.pricing.name}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Purchased: {formatDate(ticket.created_at)}
                          </span>
                          <span className="text-sm font-medium text-[#5850EC]">
                            ₦{formatPrice(ticket.pricing.amount)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 md:ml-6">
                        <Link href={`/tickets/${ticket.id}`}>
                          <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#5850EC] text-white px-4 py-2 rounded-lg hover:bg-[#6C63FF] transition-colors">
                            <QrCode className="w-4 h-4" />
                            <span>View Ticket</span>
                          </button>
                        </Link>

                        {ticket.pricing.regime.status !== "ended" &&
                          !ticket.transferred && (
                            <button
                              onClick={() => handleTransfer(ticket)}
                              className="w-full md:w-auto flex items-center justify-center gap-2 border border-[#5850EC] text-[#5850EC] px-4 py-2 rounded-lg hover:bg-[#5850EC]/5 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              <span>Transfer</span>
                            </button>
                          )}

                        <button className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
};

interface TransferTicketModalProps {
  ticket: ApiTicket;
  onClose: () => void;
}

function TransferTicketModal({ ticket, onClose }: TransferTicketModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    setIsTransferring(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTransferring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Transfer Ticket</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-1">{ticket.pricing.regime.name}</h3>
            <p className="text-sm text-gray-600">
              {formatDate(ticket.pricing.regime.start_date)} •{" "}
              {ticket.pricing.regime.venue}
            </p>
            <p className="text-sm text-gray-600">
              1 {ticket.pricing.name} ticket
            </p>
            <p className="text-sm font-medium text-[#5850EC] mt-1">
              Ticket ID: {ticket.id}
            </p>
          </div>

          {/* Transfer Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Email*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient's email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once transferred, you will no longer
                have access to this ticket. The recipient will receive an email
                with the ticket details.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={!email || isTransferring}
              className="flex-1 bg-[#5850EC] text-white py-3 rounded-lg hover:bg-[#6C63FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transfer Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketListPage;
