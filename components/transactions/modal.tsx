import { Transaction } from "@/lib/interfaces/transactionInterface";
import {
  formatActionText,
  formatAmount,
  formatDateTime,
  getActualAmount,
  getStatusColor,
  getStatusIcon,
  getTransactionIcon,
  isAffiliate,
} from "@/utils/transactions";
import { X } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetailModal({
  transaction,
  onClose,
}: Readonly<TransactionDetailModalProps>) {
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
                {isAffiliate(
                  transaction.client_id,
                  transaction?.beneficiary as string
                )
                  ? "Affiliate"
                  : formatActionText(transaction.transaction_action)}
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
                {formatAmount(transaction.actual_amount, transaction.currency)}
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
                        getActualAmount(
                          isAffiliate(
                            transaction.client_id,
                            transaction?.beneficiary as string
                          )
                            ? Number(transaction.actual_amount)
                            : Number(transaction.amount),
                          Number(transaction?.company_charge),
                          Number(transaction?.affiliate_amount)
                        ),
                        transaction.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway Fee:</span>+{""}
                    <span className="font-medium text-red-600">
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
                        {formatAmount(
                          transaction.actual_amount,
                          transaction.currency
                        )}
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
