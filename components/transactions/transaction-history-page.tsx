"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  CalendarDays,
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Transaction {
  id: string;
  client_id: string;
  regime_id: string;
  transaction_action: string;
  transaction_type: string;
  actual_amount: number;
  amount: number;
  company_charge: number;
  payment_gateway_charge: number;
  currency: string;
  status: "success" | "failed" | "pending";
  payment_gateway: string;
  created_at: string;
  regime_name: string;
  affiliate_user_name?: string;
}

// Mock API response data
const mockApiResponse = {
  message: "Transactions fetched successfully",
  data: [
    {
      id: "txn_103",
      client_id: "user_200",
      regime_id: "regime_55",
      transaction_action: "ticket-purchase",
      transaction_type: "inter-debit",
      actual_amount: 10000,
      amount: 9500,
      company_charge: 300,
      payment_gateway_charge: 200,
      currency: "ngn",
      status: "success",
      payment_gateway: "Paystack",
      created_at: "2025-07-10T10:00:00.000Z",
      regime_name: "Summer Tech Fest",
      affiliate_user_name: "janedoe",
    },
    {
      id: "txn_104",
      client_id: "user_200",
      regime_id: "regime_56",
      transaction_action: "ticket-purchase",
      transaction_type: "inter-debit",
      actual_amount: 15000,
      amount: 14250,
      company_charge: 450,
      payment_gateway_charge: 300,
      currency: "ngn",
      status: "success",
      payment_gateway: "Flutterwave",
      created_at: "2025-07-08T14:30:00.000Z",
      regime_name: "Creative Design Workshop",
      affiliate_user_name: "designpro",
    },
    {
      id: "txn_105",
      client_id: "user_200",
      regime_id: "regime_57",
      transaction_action: "ticket-refund",
      transaction_type: "inter-credit",
      actual_amount: 8000,
      amount: 7600,
      company_charge: 240,
      payment_gateway_charge: 160,
      currency: "ngn",
      status: "success",
      payment_gateway: "Paystack",
      created_at: "2025-07-05T09:15:00.000Z",
      regime_name: "Business Networking Event",
      affiliate_user_name: "biznetwork",
    },
    {
      id: "txn_106",
      client_id: "user_200",
      regime_id: "regime_58",
      transaction_action: "ticket-purchase",
      transaction_type: "inter-debit",
      actual_amount: 25000,
      amount: 23750,
      company_charge: 750,
      payment_gateway_charge: 500,
      currency: "ngn",
      status: "failed",
      payment_gateway: "Paystack",
      created_at: "2025-07-03T16:45:00.000Z",
      regime_name: "Premium Conference 2025",
      affiliate_user_name: "conforganizer",
    },
    {
      id: "txn_107",
      client_id: "user_200",
      regime_id: "regime_59",
      transaction_action: "ticket-purchase",
      transaction_type: "inter-debit",
      actual_amount: 12000,
      amount: 11400,
      company_charge: 360,
      payment_gateway_charge: 240,
      currency: "ngn",
      status: "pending",
      payment_gateway: "Flutterwave",
      created_at: "2025-07-01T11:20:00.000Z",
      regime_name: "Music Festival Lagos",
      affiliate_user_name: "musiclover",
    },
  ] as Transaction[],
  page: 1,
  limit: 5,
  total: 20,
};

const getStatusColor = (status: string) => {
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

const getStatusIcon = (status: string) => {
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

const getTransactionIcon = (action: string, type: string) => {
  if (action === "ticket-refund" || type === "inter-credit") {
    return <TrendingUp className="w-5 h-5 text-green-600" />;
  }
  return <TrendingDown className="w-5 h-5 text-red-600" />;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatAmount = (amount: number, currency: string) => {
  const symbol = currency.toLowerCase() === "ngn" ? "₦" : "$";
  return `${symbol}${(amount / 100).toFixed(2)}`;
};

const formatActionText = (action: string) => {
  return action
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function TransactionHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const transactions = mockApiResponse.data;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Status filter
      if (selectedStatus !== "all" && transaction.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const eventName = transaction.regime_name.toLowerCase();
        const transactionId = transaction.id.toLowerCase();
        const action = transaction.transaction_action.toLowerCase();
        const gateway = transaction.payment_gateway.toLowerCase();

        if (
          !eventName.includes(searchLower) &&
          !transactionId.includes(searchLower) &&
          !action.includes(searchLower) &&
          !gateway.includes(searchLower)
        ) {
          return false;
        }
      }

      // Date range filter
      if (dateRange.start && dateRange.end) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        if (transactionDate < startDate || transactionDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedStatus, searchTerm, dateRange]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const clearDateFilter = () => {
    setDateRange({ start: "", end: "" });
    setShowDateFilter(false);
  };

  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    if (transaction.status === "success") {
      return transaction.transaction_type === "inter-credit"
        ? sum + transaction.amount
        : sum - transaction.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-800 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">Transaction History</h1>
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

      {/* Summary Cards */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5850EC]/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#5850EC]" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-xl font-bold">
                  {filteredTransactions.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Successful</div>
                <div className="text-xl font-bold text-green-600">
                  {
                    filteredTransactions.filter((t) => t.status === "success")
                      .length
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Net Amount</div>
                <div
                  className={`text-xl font-bold ${
                    totalAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(Math.abs(totalAmount), "ngn")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
            />
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 min-w-[40px]">
                  From:
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="flex-1 sm:flex-none px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5850EC]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 min-w-[25px]">
                  To:
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="flex-1 sm:flex-none px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5850EC]"
                />
              </div>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={clearDateFilter}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 self-start sm:self-auto"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="sticky top-[129px] z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: "all", label: "All", count: transactions.length },
              {
                key: "success",
                label: "Success",
                count: transactions.filter((t) => t.status === "success")
                  .length,
              },
              {
                key: "pending",
                label: "Pending",
                count: transactions.filter((t) => t.status === "pending")
                  .length,
              },
              {
                key: "failed",
                label: "Failed",
                count: transactions.filter((t) => t.status === "failed").length,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedStatus(filter.key)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${
                  selectedStatus === filter.key
                    ? "bg-[#5850EC] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedStatus === filter.key
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

      {/* Transactions List */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-[#5850EC]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              No transactions found
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm || dateRange.start || dateRange.end
                ? "No transactions match your search criteria. Try adjusting your filters."
                : "You don't have any transactions yet. Start by purchasing event tickets!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Transaction Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(
                        transaction.transaction_action,
                        transaction.transaction_type
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">
                          {transaction.regime_name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {formatActionText(transaction.transaction_action)}
                        </p>
                      </div>

                      <div className="flex flex-col sm:hidden gap-2 mb-3">
                        <div
                          className={`text-lg font-bold ${
                            transaction.transaction_type === "inter-credit"
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {transaction.transaction_type === "inter-credit"
                            ? "+"
                            : "-"}
                          {formatAmount(
                            transaction.amount,
                            transaction.currency
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            via {transaction.payment_gateway}
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end">
                          <span className="text-xs text-gray-500 sm:hidden">
                            ID: {transaction.id.slice(-8)}
                          </span>
                          <span className="hidden sm:inline text-sm text-gray-500">
                            ID: {transaction.id}
                          </span>
                          <button className="text-[#5850EC] hover:text-[#6C63FF] transition-colors ml-2">
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount - Desktop Only */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <div
                      className={`text-lg font-bold ${
                        transaction.transaction_type === "inter-credit"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {transaction.transaction_type === "inter-credit"
                        ? "+"
                        : "-"}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">
              Transaction Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transaction Status */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              {getTransactionIcon(
                transaction.transaction_action,
                transaction.transaction_type
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {transaction.regime_name}
              </h3>
              <p className="text-gray-600 text-sm">
                {formatActionText(transaction.transaction_action)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div
                className={`text-lg sm:text-xl font-bold ${
                  transaction.transaction_type === "inter-credit"
                    ? "text-green-600"
                    : "text-gray-900"
                }`}
              >
                {transaction.transaction_type === "inter-credit" ? "+" : "-"}
                {formatAmount(transaction.amount, transaction.currency)}
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  transaction.status
                )}`}
              >
                {getStatusIcon(transaction.status)}
                <span className="hidden sm:inline">
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </span>
              </span>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Transaction Details
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium font-mono text-right break-all ml-2">
                      {transaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-right ml-2">
                      {formatDateTime(transaction.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize text-right ml-2">
                      {transaction.transaction_type.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Gateway:</span>
                    <span className="font-medium text-right ml-2">
                      {transaction.payment_gateway}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium uppercase text-right ml-2">
                      {transaction.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Event Information
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Event Name:</span>
                    <span className="font-medium text-right ml-2 break-words">
                      {transaction.regime_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Event ID:</span>
                    <span className="font-medium font-mono text-right ml-2 break-all">
                      {transaction.regime_id}
                    </span>
                  </div>
                  {transaction.affiliate_user_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Affiliate:</span>
                      <span className="font-medium text-right ml-2">
                        @{transaction.affiliate_user_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Amount Breakdown
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Amount:</span>
                    <span className="font-medium">
                      {formatAmount(
                        transaction.actual_amount,
                        transaction.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium text-red-600">
                      -
                      {formatAmount(
                        transaction.company_charge,
                        transaction.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway Fee:</span>
                    <span className="font-medium text-red-600">
                      -
                      {formatAmount(
                        transaction.payment_gateway_charge,
                        transaction.currency
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Final Amount:</span>
                      <span className="font-bold text-base sm:text-lg">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  User Information
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Client ID:</span>
                    <span className="font-medium font-mono text-right ml-2 break-all">
                      {transaction.client_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
            <button className="flex-1 bg-[#5850EC] text-white py-3 rounded-lg hover:bg-[#6C63FF] transition-colors text-sm sm:text-base">
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
