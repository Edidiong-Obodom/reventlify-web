export interface Transaction {
  id: string;
  client_id: string;
  beneficiary?: string;
  regime_id: string;
  transaction_action: string;
  transaction_type: string;
  actual_amount: number;
  amount: number;
  company_charge: number;
  affiliate_amount: number;
  payment_gateway_charge: number;
  currency: string;
  status: "success" | "failed" | "pending";
  payment_gateway: string;
  created_at: string;
  regime_name: string;
  affiliate_user_name?: string;
}

export interface GetTransactions {
  success: boolean;
  data: Transaction[];
  balance?: number;
  page: number;
  limit: number;
  total: number;
}
