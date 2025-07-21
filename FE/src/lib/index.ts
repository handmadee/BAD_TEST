// API Client
export { apiClient, ApiError } from "./api-client";

// Services
export { authService, isAuthenticated, getToken, logout } from "./auth-service";
export {
  courtService,
  getCourts,
  searchCourts,
  getCourtById,
  createCourt,
} from "./court-service";
export {
  teamService,
  getTeamPosts,
  searchTeamPosts,
  getTeamPostById,
  createTeamPost,
  joinTeam,
  getTeamMembers,
} from "./team-service";
export {
  bookingService,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
  calculatePrice,
} from "./booking-service";

// Fake Booking Service
export {
  FakeBookingService,
  fakeBookingService,
  type FakeBookingStats,
} from "./fake-booking-service";

// Fake Wallet Service
export { FakeWalletService, fakeWalletService } from "./fake-wallet-service";

// Payment Service
export { PaymentService, paymentService } from "./payment-service";

export {
  uploadService,
  uploadImage,
  uploadMultipleImages,
  validateImageFile,
  createPreviewUrl,
  revokePreviewUrl,
} from "./upload-service";
export { geocodingService } from "./geocoding-service";
export {
  adminService,
  getDashboardStats,
  getAllCourts,
  createCourt as adminCreateCourt,
  updateCourt,
  deleteCourt,
  createCourtOwner,
  getCourtOwners,
  getAllUsers,
  updateUserStatus,
} from "./admin-service";

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserInfo,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Court,
  CreateCourtRequest,
  CourtSearchParams,
  TeamPost,
  TeamPostUser,
  CreateTeamPostRequest,
  TeamPostSearchParams,
  TeamMember,
  Booking,
  CreateBookingRequest,
  ApiError as ApiErrorType,
} from "../types/api";
export type { UploadResponse } from "./upload-service";
export type {
  GeocodingResult,
  ReverseGeocodingResult,
} from "./geocoding-service";
export type { CreateCourtOwnerRequest, DashboardStats } from "./admin-service";

// Geocoding utilities
export * from "./geocoding";
