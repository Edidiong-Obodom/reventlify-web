"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Download,
  Send,
  Share2,
  QrCode,
  CheckCircle,
  AlertCircle,
  Ticket,
  X,
} from "lucide-react";
import ImageFallback from "../image-fallback";

interface ApiTicketDetail {
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

// Mock ticket detail data
const mockTicketDetail: ApiTicketDetail = {
  id: "tk_001",
  pricing_id: "prc_001",
  owner_id: "usr_002",
  buyer_id: "usr_001",
  transaction_id: "txn_001",
  transferred: false,
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
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ongoing":
      return "bg-green-100 text-green-800 border-green-200";
    case "ended":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-5 h-5" />;
    case "ongoing":
      return <CheckCircle className="w-5 h-5" />;
    case "ended":
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Event Upcoming";
    case "ongoing":
      return "Event Live Now";
    case "ended":
      return "Event Completed";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

export default function TicketDetailPage() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const ticketDetail = mockTicketDetail;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tickets"
                className="text-gray-800 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold">Ticket Details</h1>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Ticket Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Status Banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${getStatusColor(
            ticketDetail.pricing.regime.status
          )}`}
        >
          {getStatusIcon(ticketDetail.pricing.regime.status)}
          <div>
            <div className="font-semibold">
              {getStatusText(ticketDetail.pricing.regime.status)}
            </div>
            <div className="text-sm opacity-80">
              {ticketDetail.pricing.regime.status === "pending" &&
                "Your ticket is ready for the upcoming event"}
              {ticketDetail.pricing.regime.status === "ongoing" &&
                "The event is currently happening"}
              {ticketDetail.pricing.regime.status === "ended" &&
                "This event has concluded"}
            </div>
          </div>
          {ticketDetail.transferred && (
            <div className="ml-auto">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Transferred
              </span>
            </div>
          )}
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Event Image */}
          <div className="relative h-48 md:h-64">
            <ImageFallback
              src={ticketDetail.pricing.regime.media[0] || "/placeholder.svg"}
              fallbackSrc="/placeholder.svg?height=300&width=600"
              alt={ticketDetail.pricing.regime.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold mb-2">
                {ticketDetail.pricing.regime.name}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(ticketDetail.pricing.regime.start_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(ticketDetail.pricing.regime.start_time)} -{" "}
                    {formatTime(ticketDetail.pricing.regime.end_time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 border-b bg-gradient-to-r from-[#5850EC]/5 to-[#6C63FF]/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-[#5850EC]/30 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-[#5850EC]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-2">
                  Your Digital Ticket
                </h3>
                <p className="text-gray-600 mb-3">
                  Show this QR code at the venue entrance for quick check-in
                </p>
                <div className="bg-white rounded-lg p-3 inline-block">
                  <div className="font-mono text-sm text-gray-800">
                    {ticketDetail.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Event Details
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">
                          {ticketDetail.pricing.regime.venue}
                        </div>
                        <div className="text-sm">
                          {ticketDetail.pricing.regime.address},{" "}
                          {ticketDetail.pricing.regime.city},{" "}
                          {ticketDetail.pricing.regime.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        Organized by @
                        {ticketDetail.pricing.regime.creator.user_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      <span className="capitalize">
                        {ticketDetail.pricing.regime.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ticket Information
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Ticket Type:</span>
                      <span className="font-medium">
                        {ticketDetail.pricing.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium text-[#5850EC]">
                        ₦{formatPrice(ticketDetail.pricing.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-medium text-sm">
                        {ticketDetail.transaction_id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Purchase Information
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Purchase Date:</span>
                      <span className="font-medium">
                        {formatDate(ticketDetail.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buyer ID:</span>
                      <span className="font-medium">
                        {ticketDetail.buyer_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Owner:</span>
                      <span className="font-medium">
                        {ticketDetail.owner_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${
                          ticketDetail.transferred
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {ticketDetail.transferred ? "Transferred" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Event Duration
                  </h4>
                  <div className="text-gray-600">
                    <div className="text-sm">
                      {formatDate(ticketDetail.pricing.regime.start_date)} -{" "}
                      {formatDate(ticketDetail.pricing.regime.end_date)}
                    </div>
                    <div className="text-sm">
                      {formatTime(ticketDetail.pricing.regime.start_time)} -{" "}
                      {formatTime(ticketDetail.pricing.regime.end_time)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 bg-[#5850EC] text-white py-3 px-4 rounded-xl hover:bg-[#6C63FF] transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </button>

          {ticketDetail.pricing.regime.status !== "ended" &&
            !ticketDetail.transferred && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center justify-center gap-2 border border-[#5850EC] text-[#5850EC] py-3 px-4 rounded-xl hover:bg-[#5850EC]/5 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>Transfer Ticket</span>
              </button>
            )}

          <Link href={`/events/${ticketDetail.pricing.regime.id}`}>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
              <Ticket className="w-5 h-5" />
              <span>View Event</span>
            </button>
          </Link>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive at least 30 minutes before the event starts</li>
            <li>
              • Bring a valid ID that matches the ticket holder information
            </li>
            <li>
              • Screenshots of tickets are not accepted - use the original QR
              code
            </li>
            <li>
              • Tickets are non-refundable but can be transferred to another
              person
            </li>
            <li>• Contact the organizer for any event-specific inquiries</li>
          </ul>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          ticket={ticketDetail}
          onClose={() => setShowTransferModal(false)}
        />
      )}
    </div>
  );
}

interface TransferModalProps {
  ticket: ApiTicketDetail;
  onClose: () => void;
}

function TransferModal({ ticket, onClose }: TransferModalProps) {
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
              {ticket.id}
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
                with the ticket details and QR code.
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
                  <span>Transfer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
