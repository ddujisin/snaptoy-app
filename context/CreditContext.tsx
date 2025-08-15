import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Alert } from "react-native";
import {
  CreditBalanceResponse,
  CreditPackageResponse,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  SubscriptionUpdateRequest,
  ApiResponse,
} from "../types/api";
import { apiService, handleApiError } from "../services/api";

// Mock StoreKit for development - replace with actual expo-store-kit when available
const MockStoreKit = {
  async requestPurchase(productId: string) {
    Alert.alert("Mock Purchase", `Would purchase: ${productId}`);
    return { success: true, transactionId: `mock_${Date.now()}` };
  },
  async restorePurchases() {
    Alert.alert("Mock Restore", "Would restore purchases");
    return { success: true };
  },
};

interface CreditState {
  photoCredits: number;
  subscriptionTier: string;
  availablePackages: CreditPackageResponse[];
  purchaseHistory: CreditPurchaseResponse[];
  isLoading: boolean;
  error: string | null;
}

interface CreditAction {
  type:
    | "SET_BALANCE"
    | "SET_PACKAGES"
    | "SET_PURCHASE_HISTORY"
    | "SET_LOADING"
    | "SET_ERROR"
    | "CONSUME_CREDIT"
    | "ADD_PURCHASE";
  payload?: any;
}

const initialState: CreditState = {
  photoCredits: 0,
  subscriptionTier: "free",
  availablePackages: [],
  purchaseHistory: [],
  isLoading: false,
  error: null,
};

function creditReducer(state: CreditState, action: CreditAction): CreditState {
  switch (action.type) {
    case "SET_BALANCE":
      return {
        ...state,
        photoCredits: action.payload.photoCredits,
        subscriptionTier: action.payload.subscriptionTier,
        isLoading: false,
        error: null,
      };
    case "SET_PACKAGES":
      return {
        ...state,
        availablePackages: action.payload,
        isLoading: false,
        error: null,
      };
    case "SET_PURCHASE_HISTORY":
      return {
        ...state,
        purchaseHistory: action.payload,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "CONSUME_CREDIT":
      return {
        ...state,
        photoCredits: Math.max(0, state.photoCredits - 1),
      };
    case "ADD_PURCHASE":
      return {
        ...state,
        purchaseHistory: [action.payload, ...state.purchaseHistory],
        photoCredits: state.photoCredits + action.payload.creditsAwarded,
      };
    default:
      return state;
  }
}

interface CreditContextType {
  creditState: CreditState;
  refreshBalance: () => Promise<void>;
  refreshPackages: () => Promise<void>;
  purchaseCredits: (packageId: string) => Promise<boolean>;
  upgradeSubscription: (tier: "standard" | "pro") => Promise<boolean>;
  getPurchaseHistory: () => Promise<void>;
  consumeCredit: () => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(creditReducer, initialState);

  const refreshBalance = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await apiService.getCreditBalance();
      dispatch({
        type: "SET_BALANCE",
        payload: {
          photoCredits: response.photoCredits,
          subscriptionTier: response.subscriptionTier,
        },
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  const refreshPackages = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const packages = await apiService.getCreditPackages();
      dispatch({ type: "SET_PACKAGES", payload: packages });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  const purchaseCredits = async (packageId: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Mock purchase flow - replace with actual expo-store-kit
      const mockResult = await MockStoreKit.requestPurchase(packageId);

      if (mockResult.success) {
        const purchaseRequest: CreditPurchaseRequest = {
          packageId: parseInt(packageId, 10),
          appleReceiptData: mockResult.transactionId, // Using transactionId as mock receipt
        };

        const result = await apiService.purchaseCredits(purchaseRequest);
        dispatch({ type: "ADD_PURCHASE", payload: result });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return false;
    }
  };

  const upgradeSubscription = async (
    tier: "standard" | "pro"
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const request: SubscriptionUpdateRequest = {
        subscriptionTier: tier,
        receiptData: `mock_sub_${Date.now()}`, // Mock receipt data
      };

      await apiService.updateSubscription(request);
      await refreshBalance(); // Refresh to get updated subscription tier
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return false;
    }
  };

  const getPurchaseHistory = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const history = await apiService.getPurchaseHistory();
      dispatch({ type: "SET_PURCHASE_HISTORY", payload: history.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  const consumeCredit = () => {
    dispatch({ type: "CONSUME_CREDIT" });
  };

  // Initialize credit state when provider mounts
  useEffect(() => {
    refreshBalance();
    refreshPackages();
  }, []);

  const contextValue: CreditContextType = {
    creditState: state,
    refreshBalance,
    refreshPackages,
    purchaseCredits,
    upgradeSubscription,
    getPurchaseHistory,
    consumeCredit,
  };

  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
