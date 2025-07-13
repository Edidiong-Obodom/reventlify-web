"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  CalendarDays,
  X,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactions, searchForTransactions } from "@/lib/api/transaction";
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import {
  formatActionText,
  formatAmount,
  formatDate,
  getStatusColor,
  getStatusIcon,
  getTransactionIcon,
  isAffiliate,
} from "@/utils/transactions";
import TransactionDetailModal from "./modal";
import { Transaction } from "@/lib/interfaces/transactionInterface";

export default function TransactionHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { data: session } = useSession();
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
      "transactions",
      session?.accessToken,
      debouncedSearch,
      dateRange.start,
      dateRange.end,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (debouncedSearch.trim()) {
        return searchForTransactions(
          session?.accessToken!,
          debouncedSearch,
          dateRange.start || undefined,
          dateRange.end || undefined,
          pageParam,
          limit
        );
      } else {
        return getTransactions(
          session?.accessToken!,
          pageParam,
          limit,
          dateRange.start || undefined,
          dateRange.end || undefined
        );
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < limit) return undefined;
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

  const transactions = data?.pages.flatMap((page) => page.data) || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Status filter
      if (selectedStatus !== "all" && transaction.status !== selectedStatus) {
        return false;
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
      return transaction.transaction_type === "inter-credit" &&
        transaction?.beneficiary === transaction?.client_id
        ? sum + Number(transaction.actual_amount)
        : transaction?.beneficiary === session?.user?.id
        ? sum + Number(transaction.actual_amount)
        : sum - Number(transaction.amount);
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
        {isLoading || isFetchingNextPage ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={`loading-${i}`}
                className="h-20 bg-white rounded-lg shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Failed to load transactions.
          </div>
        ) : filteredTransactions.length === 0 &&
          data?.pages[0]?.data.length === 0 ? (
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
                          {isAffiliate(
                            transaction.client_id,
                            transaction?.beneficiary
                          )
                            ? "Affiliate"
                            : formatActionText(transaction.transaction_action)}
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
                            transaction.actual_amount,
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
                      {formatAmount(
                        transaction.actual_amount,
                        transaction.currency
                      )}
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
