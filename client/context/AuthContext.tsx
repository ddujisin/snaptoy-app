import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, User, AppleAuthCredential } from "../types/auth";

interface AuthContextType {
  authState: AuthState;
  signIn: (credential: AppleAuthCredential) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "SIGN_IN_START" }
  | { type: "SIGN_IN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "SIGN_IN_ERROR"; payload: string }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING"; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SIGN_IN_START":
      return { ...state, isLoading: true, error: null };
    case "SIGN_IN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        sessionToken: action.payload.token,
        isLoading: false,
        error: null,
      };
    case "SIGN_IN_ERROR":
      return {
        ...state,
        user: null,
        sessionToken: null,
        isLoading: false,
        error: action.payload,
      };
    case "SIGN_OUT":
      return {
        ...state,
        user: null,
        sessionToken: null,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, dispatch] = useReducer(authReducer, {
    user: null,
    sessionToken: null,
    isLoading: true,
    error: null,
  });

  const signIn = async (credential: AppleAuthCredential) => {
    dispatch({ type: "SIGN_IN_START" });
    try {
      // Mock successful sign-in for now
      const mockUser: User = {
        id: "1",
        email: credential.email || "user@apple.com",
        firstName: credential.fullName?.givenName || "John",
        lastName: credential.fullName?.familyName || "Doe",
        appleId: credential.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({
        type: "SIGN_IN_SUCCESS",
        payload: { user: mockUser, token: "mock-token-123" },
      });
    } catch (error: any) {
      dispatch({ type: "SIGN_IN_ERROR", payload: error.message });
    }
  };

  const signOut = async () => {
    dispatch({ type: "SIGN_OUT" });
  };

  const refreshToken = async () => {
    // Mock token refresh
  };

  useEffect(() => {
    // Check for stored auth on app start
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  return (
    <AuthContext.Provider value={{ authState, signIn, signOut, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
