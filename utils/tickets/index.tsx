import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const getStatusColor = (status: string) => {
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

export const getDetailsStatusColor = (status: string) => {
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

export const getStatusText = (status: string) => {
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

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (timeString: string) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatPrice = (amount: number) => {
  return Number(amount.toFixed(2)).toLocaleString();
};

export const getStatusIcon = (status: string) => {
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
