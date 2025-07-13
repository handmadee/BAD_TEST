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

// Geocoding utilities
export * from "./geocoding";
