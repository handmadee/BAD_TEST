"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService, ApiError } from "@/lib";
import { User, LoginRequest, RegisterRequest } from "@/types/api";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    initializeAuth: () => Promise<void>;
}

type AuthAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_USER"; payload: { user: User; token: string } }
    | { type: "LOGOUT" }
    | { type: "UPDATE_USER"; payload: User };

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_USER":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case "LOGOUT":
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case "UPDATE_USER":
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            // Try to get current user if token exists
            const user = await authService.initializeAuth();

            if (user) {
                const token = authService.getToken();
                if (token) {
                    dispatch({ type: "SET_USER", payload: { user, token } });
                } else {
                    dispatch({ type: "SET_LOADING", payload: false });
                }
            } else {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            // Clear any invalid tokens
            authService.logout();
            dispatch({ type: "LOGOUT" });
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const response = await authService.login(credentials);

            if (response.success) {
                // Get current user info
                const userResponse = await authService.getCurrentUser();

                dispatch({
                    type: "SET_USER",
                    payload: {
                        user: userResponse.data,
                        token: response.data.accessToken, // Sử dụng accessToken thay vì token
                    },
                });
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const response = await authService.register(userData);

            if (response.success) {
                // Get current user info
                const userResponse = await authService.getCurrentUser();

                dispatch({
                    type: "SET_USER",
                    payload: {
                        user: userResponse.data,
                        token: response.data.accessToken, // Sử dụng accessToken thay vì token
                    },
                });
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        dispatch({ type: "LOGOUT" });
    };

    const updateUser = async (userData: Partial<User>) => {
        try {
            // Gọi API update profile
            const response = await authService.updateProfile(userData);
            if (response.success) {
                dispatch({ type: "UPDATE_USER", payload: response.data });
            }
        } catch (error) {
            console.error("Update user error:", error);
            throw error;
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        updateUser,
        initializeAuth,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
