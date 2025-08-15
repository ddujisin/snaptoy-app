import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { AuthState, User, AppleAuthCredential } from "../types/auth";
import { UserResponse } from "../types/api";
import { apiService, handleApiError } from "../services/api";

interface AuthContextType {
  authState: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "SIGN_IN_START" }
  | { type: "SIGN_IN_SUCCESS"; payload: { user: UserResponse; token: string } }
  | { type: "SIGN_IN_ERROR"; payload: string }
  | { type: "SIGN_OUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AVAILABILITY"; payload: boolean };

interface AuthStateInternal extends AuthState {
  isAvailable: boolean;
}

function authReducer(
  state: AuthStateInternal,
  action: AuthAction
): AuthStateInternal {
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
    case "SET_AVAILABILITY":
      return { ...state, isAvailable: action.payload };
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
    isAvailable: false,
  });

  const signIn = async () => {
    dispatch({ type: "SIGN_IN_START" });
    try {
      // Request Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send to backend for verification
      const authResponse = await apiService.signInWithApple({
        identityToken: credential.identityToken || "",
        user: {
          firstName: credential.fullName?.givenName || undefined,
          lastName: credential.fullName?.familyName || undefined,
          email: credential.email || undefined,
        },
      });

      dispatch({
        type: "SIGN_IN_SUCCESS",
        payload: {
          user: authResponse.user,
          token: authResponse.sessionToken,
        },
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SIGN_IN_ERROR", payload: errorMessage });
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      dispatch({ type: "SIGN_OUT" });
    } catch (error: any) {
      console.error("Sign out error:", error);
      // Still sign out locally even if backend call fails
      dispatch({ type: "SIGN_OUT" });
    }
  };

  const refreshToken = async () => {
    try {
      const authResponse = await apiService.refreshToken();
      dispatch({
        type: "SIGN_IN_SUCCESS",
        payload: {
          user: authResponse.user,
          token: authResponse.sessionToken,
        },
      });
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      dispatch({ type: "SIGN_OUT" });
    }
  };

  const checkAppleSignInAvailability = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      dispatch({ type: "SET_AVAILABILITY", payload: isAvailable });
    } catch (error) {
      console.error("Apple Sign-In availability check failed:", error);
      dispatch({ type: "SET_AVAILABILITY", payload: false });
    }
  };

  const checkStoredAuth = async () => {
    try {
      // Try to validate existing token
      const validation = await apiService.validateToken();
      if (validation.valid && validation.user) {
        dispatch({
          type: "SIGN_IN_SUCCESS",
          payload: {
            user: validation.user,
            token: "", // Token is already stored
          },
        });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Auth validation failed:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAppleSignInAvailability();
      await checkStoredAuth();
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signOut,
        refreshToken,
        isAvailable: authState.isAvailable,
      }}
    >
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
