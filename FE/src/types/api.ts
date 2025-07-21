// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

// User types
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  role: "USER" | "COURT_OWNER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  avatarUrl?: string;
  bio?: string;
  location?: string;
  skillLevel?: string;
  preferredSports?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserInfo;
}

// Court types
export interface CourtPricing {
  timeSlot: string;
  weekdayPrice: number;
  weekendPrice: number;
}

export interface Court {
  id: number;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  sportTypes?: string;
  amenities?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  totalReviews?: number;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  distance?: number; // km from user location
  price?: number; // minimum price in VND
  pricing?: CourtPricing[]; // Price schedule
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourtRequest {
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  sportTypes?: string;
  amenities?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

export interface CourtSearchParams {
  keyword?: string;
  sportType?: string;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

// Team Post types
export interface TeamPostUser {
  id: number;
  fullName: string;
  email: string;
}

export interface TeamPost {
  id: number;
  user: TeamPostUser;
  title: string;
  description: string;
  playDate: string;
  location: string;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel?: string;
  sportType: "BADMINTON" | "PICKLEBALL";
  status: "OPEN" | "CLOSED" | "CANCELLED";
  images?: string[];
  isFull: boolean;
  canJoin: boolean;
  availableSlots: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTeamPostRequest {
  title: string;
  description: string;
  playDate: string; // Will be converted to LocalDateTime in service
  location: string;
  maxPlayers: number;
  skillLevel?: string;
  sportType: string; // "BADMINTON" | "PICKLEBALL"
  images?: string[];
}

export interface TeamPostSearchParams {
  keyword?: string;
  sport?: string;
  skillLevel?: string;
  location?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface TeamMember {
  id: number;
  user: TeamPostUser;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  joinedAt: string;
}

// Booking types
export interface Booking {
  id: number;
  court: Court;
  user: User;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingRequest {
  courtId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

// Wallet types re-export
export type {
  Wallet,
  Transaction,
  WalletStats,
  WalletSummary,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  TransactionFilter,
  TopUpRequest,
  WithdrawalRequest,
  TransferRequest,
} from "./wallet";

// Payment types re-export
export type {
  PaymentRequest,
  PaymentStatus,
  PaymentType,
  QRPaymentData,
  PaymentProcessingState,
} from "./payment";
