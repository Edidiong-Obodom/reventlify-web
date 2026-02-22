"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Download,
  Send,
  Ticket,
  AlertCircle,
  Mail,
} from "lucide-react";
import ImageFallback from "../image-fallback";
import {
  formatDate,
  formatPrice,
  formatTime,
  getDetailsStatusColor,
  getStatusIcon,
  getStatusText,
} from "@/utils/tickets";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchForTickets } from "@/lib/api/tickets";
import FullScreenLoader from "../common/loaders/fullScreenLoader";
import { capitalizeFirst } from "@/lib";
import { slugify } from "@/lib/helpers/formatEventDetail";
import QRCodeStyling from "qr-code-styling";
import { TransferModal } from "./modal";

export default function TicketDetailPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const { data: session } = useSession();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ticket-detail", id],
    queryFn: () =>
      searchForTickets(
        session?.accessToken as string,
        id as string,
        undefined,
        undefined,
        1,
        1,
      ),
  });

  // Step 1: Create QR code instance once when data is available
  useEffect(() => {
    if (data?.data?.length) {
      const initialPayload = `${Date.now()}:${data.data[0].id}`;

      const styleCode = new QRCodeStyling({
        width: 120,
        height: 120,
        type: "svg",
        data: initialPayload,
        image: undefined, // Optional: you can add a logo later
        dotsOptions: {
          color: "#5850EC",
          type: "rounded",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#5850EC",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
      });

      setQrCode(styleCode);
    }
  }, [data]);

  // Refresh QR payload periodically to reduce replay/screenshot abuse.
  useEffect(() => {
    if (!data?.data?.[0]?.id || !qrCode) return;

    const updatePayload = () => {
      const nextPayload = `${Date.now()}:${data.data[0].id}`;
      qrCode.update({ data: nextPayload });
    };

    const timer = setInterval(updatePayload, 15000);
    return () => clearInterval(timer);
  }, [data, qrCode]);

  // Step 2: Mount QR code into DOM when `qrCode` is ready
  useEffect(() => {
    if (ref.current && qrCode) {
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  if (isLoading) {
    return <FullScreenLoader backGround="light" />;
  }

  if (error || !data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-gray-500 max-w-md mb-4">
          We couldn't find the ticket you're looking for. You may have
          transferred ownership of the ticket.
        </p>
      </div>
    );
  }

  const ticketDetail = data?.data[0];

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
            {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-6 h-6" />
            </button> */}
          </div>
        </div>
      </header>

      {/* Ticket Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Status Banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${getDetailsStatusColor(
            ticketDetail.pricing.regime.status,
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
        </div>
        {ticketDetail.is_transferred && (
          <div className="my-4">
            {ticketDetail.buyer_id === session?.user?.id ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Transferred
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-100 text-green-800 text-sm font-medium rounded-full">
                Received
              </span>
            )}
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Event Image */}
          <div className="relative h-48 md:h-64">
            <ImageFallback
              src={ticketDetail.pricing.regime.media || "/placeholder.svg"}
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
          {ticketDetail.owner_id === session?.user.id && (
            <div className="p-6 border-b bg-gradient-to-r from-[#5850EC]/5 to-[#6C63FF]/5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-[#5850EC]/30 flex items-center justify-center">
                    {/* <QrCode className="w-16 h-16 text-[#5850EC]" /> */}
                    <div ref={ref} />
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
          )}

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
                          {capitalizeFirst(ticketDetail.pricing.regime.city)},{" "}
                          {capitalizeFirst(ticketDetail.pricing.regime.state)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        Organized by
                        <Link
                          href={`/profile/${ticketDetail.pricing.regime.creator.id}`}
                          className="text-blue-600"
                        >
                          {" "}
                          @{ticketDetail.pricing.regime.creator.user_name}
                        </Link>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span> {ticketDetail.pricing.regime.creator.email}</span>
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
                        {formatPrice(ticketDetail?.pricing?.amount) === "0"
                          ? "Free"
                          : `₦${formatPrice(ticketDetail?.pricing?.amount)}`}
                      </span>
                    </div>
                    <div className="flex flex-col">
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
                    <div className="flex flex-col">
                      <span>Buyer ID:</span>
                      <span className="font-medium">
                        {ticketDetail.buyer_id}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span>Current Owner:</span>
                      <span className="font-medium">
                        {ticketDetail.owner_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${
                          ticketDetail.is_transferred &&
                          ticketDetail.owner_id !== session?.user.id
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {ticketDetail.is_transferred &&
                        ticketDetail.owner_id !== session?.user.id
                          ? "Transferred"
                          : "Active"}
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
            !ticketDetail.is_transferred && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center justify-center gap-2 border border-[#5850EC] text-[#5850EC] py-3 px-4 rounded-xl hover:bg-[#5850EC]/5 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>Transfer Ticket</span>
              </button>
            )}

          <Link
            href={`/events/view/${slugify(
              ticketDetail.pricing.regime.name as string,
            )}`}
          >
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
              person by the buyer
            </li>
            <li>
              • Contact the organizer for any event-specific inquiries.
              Organizer's email is the only email on the ticket.
            </li>
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
