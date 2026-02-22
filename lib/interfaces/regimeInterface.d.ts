export type RegimeType =
  | "concert"
  | "conference"
  | "theatre"
  | "pageantry"
  | "service"
  | "education"
  | "carnival"
  | "festival"
  | "party"
  | "sport"
  | "talent-show"
  | "exhibition"
  | "fashion";

export interface Pricing {
  id: string;
  name: string;
  amount: number;
  total_seats: number;
  available_seats: number;
}

export interface Regime {
  id: string | number;
  name: string;
  type: string;
  creator_id: string;
  creator_user_name: string;
  creator_photo: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  venue: string;
  start_date: string; // ISO date string
  start_time: string; // HH:MM:SS
  end_date: string; // ISO date string
  end_time: string; // HH:MM:SS
  regime_banner: string;
  regime_gallery: string[];
  total_ticket_sales: string;
  total_revenue: string;
  participant_role?: string | null;
  pricings: Pricing[];
  is_bookmarked?: boolean;
}

export interface SearchRegimes {
  searchString: string;
  type?: RegimeType;
  page: number;
  limit: number;
}

export interface GetRegimes {
  success: boolean;
  data: Regime[];
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  icon: React.ElementType;
  color?: string;
}

export interface CategoryCardProps {
  category: Category;
}
