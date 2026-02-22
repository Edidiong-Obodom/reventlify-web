export interface Ticket {
  id: string;
  pricing_id: string;
  owner_id: string;
  buyer_id: string;
  transaction_id: string;
  is_transferred: boolean;
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
      media: string;
      status: "pending" | "ongoing" | "ended";
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      creator: {
        id: string;
        user_name: string;
        email: string;
      };
    };
  };
}

export interface ApiTicket {
  success: boolean;
  data: Ticket[];
  page: number;
  limit: number;
  total: number;
}
