import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ReactNode } from "react";
import { formatPrice } from "../tickets";

/** Checks if the transaction is from an affiliate */
export const isAffiliate = (
  clientId: string,
  beneficiary?: string
): boolean => {
  if (beneficiary) {
    return clientId !== beneficiary;
  } else {
    return false;
  }
};

/** Calculates the actual amount including charges */
export const getActualAmount = (
  amount: number,
  companyCharge: number,
  affiliateAmount: number
): number => {
  return Number(amount + companyCharge + affiliateAmount);
};

/** Gets Tailwind status badge color */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/** Gets status icon */
export const getStatusIcon = (status: string): ReactNode => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "failed":
      return <XCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

/** Gets transaction icon based on action/type */
export const getTransactionIcon = (action: string, type: string): ReactNode => {
  if (action === "ticket-refund" || type === "inter-credit") {
    return <TrendingUp className="w-5 h-5 text-green-600" />;
  }
  return <TrendingDown className="w-5 h-5 text-red-600" />;
};

/** Formats date as 'MMM DD, YYYY' */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Formats full date with time as 'MMM DD, YYYY, HH:MM AM/PM' */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/** Formats amount with currency symbol */
export const formatAmount = (amount: number, currency: string): string => {
  const symbol = currency.toLowerCase() === "ngn" ? "₦" : "$";
  return `${symbol}${formatPrice(Number(amount))}`;
};

/** Converts kebab-case action into human-readable label */
export const formatActionText = (action: string): string => {
  return action
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
