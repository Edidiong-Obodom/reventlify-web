"use client";

import { Ticket } from "@/lib/interfaces/ticketInterface";
import { transferTicket } from "@/lib/api/tickets";
import { formatDate } from "@/utils/tickets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface TransferTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}
interface TransferModalContentProps extends TransferTicketModalProps {
  ctaLabel: string;
}

function TransferModalContent({
  ticket,
  onClose,
  ctaLabel,
}: Readonly<TransferModalContentProps>) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const { mutateAsync, isPending: isTransferring } = useMutation({
    mutationFn: (payload: {
      beneficiary: string;
      ticket: string;
      comment?: string;
    }) =>
      transferTicket(session?.accessToken as string, payload),
  });

  const handleTransfer = async () => {
    const beneficiary = email.trim();
    const comment = message.trim();
    if (!session?.accessToken) {
      return toast.error("Please sign in to transfer your ticket.");
    }
    if (!beneficiary) {
      return toast.error("Recipient email is required.");
    }

    try {
      const response = await mutateAsync({
        beneficiary,
        ticket: ticket.id,
        ...(comment ? { comment } : {}),
      });
      toast.success(response?.message ?? "Ticket transferred successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["ticket-detail"] }),
      ]);
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Ticket transfer failed.");
    }
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
                htmlFor="beneficiary"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Email*
              </label>
              <input
                type="email"
                id="beneficiary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient's email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message (Optional)
              </label>
              <textarea
                id="comment"
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
              disabled={!email.trim() || isTransferring}
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
                  <span>{ctaLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransferTicketModal({
  ticket,
  onClose,
}: Readonly<TransferTicketModalProps>) {
  return (
    <TransferModalContent
      ticket={ticket}
      onClose={onClose}
      ctaLabel="Transfer Ticket"
    />
  );
}

interface TransferModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function TransferModal({ ticket, onClose }: TransferModalProps) {
  return (
    <TransferModalContent ticket={ticket} onClose={onClose} ctaLabel="Transfer" />
  );
}
