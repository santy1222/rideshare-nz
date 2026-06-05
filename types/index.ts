export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  avg_rating: number;
  total_reviews: number;
  suspended: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  seats_available: number;
  price: number | null;
  description: string | null;
  status: "active" | "cancelled" | "completed";
  created_at: string;
  profiles?: Profile;
}

export interface Review {
  id: string;
  trip_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface TripWithDriver extends Trip {
  profiles: Profile;
}

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  passenger?: Profile;
}

export interface Message {
  id: string;
  trip_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  trip?: { origin: string; destination: string };
}
