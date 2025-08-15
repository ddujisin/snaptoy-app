// Main API service following backend documentation
import axios, { AxiosInstance, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import {
  ApiResponse,
  AppleSignInRequest,
  AuthResponse,
  UserResponse,
  PhotoTransformResponse,
  CreditPackageResponse,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  CreditBalanceResponse,
  SubscriptionUpdateRequest,
  TransformHistoryParams,
  PaginationParams,
  HealthCheckResponse,
  ApiInfoResponse,
} from "../../types/api";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_ERROR_CODES,
} from "../../constants/api";

class ApiService {
  private client: AxiosInstance;
  private static instance: ApiService;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds for image processing
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    // Request interceptor to add session token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredSessionToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle token expiration
        if (error.response?.status === 401 && originalRequest) {
          try {
            await this.refreshToken();
            const token = await this.getStoredSessionToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.clearSessionToken();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private async getStoredSessionToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync("sessionToken");
    } catch (error) {
      console.error("Failed to get session token:", error);
      return null;
    }
  }

  private async storeSessionToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync("sessionToken", token);
    } catch (error) {
      console.error("Failed to store session token:", error);
      throw error;
    }
  }

  private async clearSessionToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("sessionToken");
    } catch (error) {
      console.error("Failed to clear session token:", error);
    }
  }

  // Authentication endpoints
  async signInWithApple(credential: AppleSignInRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.apple,
      credential
    );

    if (response.data.success && response.data.data) {
      await this.storeSessionToken(response.data.data.sessionToken);
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Sign-in failed");
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.refresh
    );

    if (response.data.success && response.data.data) {
      await this.storeSessionToken(response.data.data.sessionToken);
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Token refresh failed");
  }

  async validateToken(): Promise<{ valid: boolean; user?: UserResponse }> {
    const response = await this.client.get<
      ApiResponse<{ valid: boolean; user?: UserResponse }>
    >(API_ENDPOINTS.auth.validate);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Token validation failed");
  }

  async signOut(): Promise<void> {
    await this.clearSessionToken();
  }

  // User profile endpoints
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<ApiResponse<UserResponse>>(
      API_ENDPOINTS.users.me
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get user profile"
    );
  }

  async updateUserProfile(
    updates: Partial<Pick<UserResponse, "firstName" | "lastName" | "email">>
  ): Promise<UserResponse> {
    const response = await this.client.put<ApiResponse<UserResponse>>(
      API_ENDPOINTS.users.me,
      updates
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Failed to update profile");
  }

  async getUserCredits(): Promise<CreditBalanceResponse> {
    const response = await this.client.get<ApiResponse<CreditBalanceResponse>>(
      API_ENDPOINTS.users.credits
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get credit balance"
    );
  }

  // Photo transformation endpoints
  async transformPhoto(
    imageUri: string,
    backgroundType: "cartoon" | "lego" | "photo",
    customPrompt?: string
  ): Promise<PhotoTransformResponse> {
    const formData = new FormData();

    // Add image file
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);

    // Add transformation parameters
    formData.append("backgroundType", backgroundType);
    if (customPrompt) {
      formData.append("customPrompt", customPrompt);
    }

    const response = await this.client.post<
      ApiResponse<PhotoTransformResponse>
    >(API_ENDPOINTS.transform.create, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Photo transformation failed"
    );
  }

  async getTransformationHistory(params?: TransformHistoryParams): Promise<{
    data: PhotoTransformResponse[];
    meta?: {
      total?: number;
      limit?: number;
      offset?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }> {
    const response = await this.client.get<
      ApiResponse<PhotoTransformResponse[]>
    >(API_ENDPOINTS.transform.history, { params });

    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    }

    throw new Error(
      response.data.error?.message || "Failed to get transformation history"
    );
  }

  async getTransformationById(id: string): Promise<PhotoTransformResponse> {
    const response = await this.client.get<ApiResponse<PhotoTransformResponse>>(
      API_ENDPOINTS.transform.getById(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get transformation"
    );
  }

  // Credit and package endpoints
  async getAvailablePackages(): Promise<CreditPackageResponse[]> {
    const response = await this.client.get<
      ApiResponse<CreditPackageResponse[]>
    >(API_ENDPOINTS.credits.packages);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get available packages"
    );
  }

  async purchaseCredits(
    request: CreditPurchaseRequest
  ): Promise<CreditPurchaseResponse> {
    const response = await this.client.post<
      ApiResponse<CreditPurchaseResponse>
    >(API_ENDPOINTS.credits.purchase, request);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Credit purchase failed");
  }

  async updateSubscription(
    request: SubscriptionUpdateRequest
  ): Promise<CreditBalanceResponse> {
    const response = await this.client.put<ApiResponse<CreditBalanceResponse>>(
      API_ENDPOINTS.credits.subscription,
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Subscription update failed"
    );
  }

  async getPurchaseHistory(params?: PaginationParams): Promise<{
    data: CreditPurchaseResponse[];
    meta?: {
      total?: number;
      limit?: number;
      offset?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }> {
    const response = await this.client.get<
      ApiResponse<CreditPurchaseResponse[]>
    >(API_ENDPOINTS.credits.history, { params });

    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    }

    throw new Error(
      response.data.error?.message || "Failed to get purchase history"
    );
  }

  // Credit endpoints
  async getCreditBalance(): Promise<CreditBalanceResponse> {
    const response = await this.client.get<ApiResponse<CreditBalanceResponse>>(
      API_ENDPOINTS.credits.balance
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get credit balance"
    );
  }

  async getCreditPackages(): Promise<CreditPackageResponse[]> {
    const response = await this.client.get<
      ApiResponse<CreditPackageResponse[]>
    >(API_ENDPOINTS.credits.packages);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.error?.message || "Failed to get credit packages"
    );
  }

  // System endpoints
  async getHealthCheck(): Promise<HealthCheckResponse> {
    const response = await this.client.get<ApiResponse<HealthCheckResponse>>(
      API_ENDPOINTS.system.health
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Health check failed");
  }

  async getApiInfo(): Promise<ApiInfoResponse> {
    const response = await this.client.get<ApiResponse<ApiInfoResponse>>(
      API_ENDPOINTS.system.info
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || "Failed to get API info");
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    const { code, message } = error.response.data.error;

    switch (code) {
      case API_ERROR_CODES.INSUFFICIENT_CREDITS:
        return "Insufficient credits. Please purchase more credits to continue.";
      case API_ERROR_CODES.INVALID_IMAGE:
        return "Invalid image format. Please try with a different photo.";
      case API_ERROR_CODES.TRANSFORMATION_ERROR:
        return "Photo transformation failed. Please try again.";
      case API_ERROR_CODES.AUTHENTICATION_REQUIRED:
        return "Please sign in to continue.";
      case API_ERROR_CODES.INVALID_TOKEN:
        return "Session expired. Please sign in again.";
      case API_ERROR_CODES.RATE_LIMITED:
        return "Too many requests. Please try again later.";
      case API_ERROR_CODES.SERVICE_UNAVAILABLE:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return message || "Something went wrong. Please try again.";
    }
  } else if (error.message) {
    return error.message;
  } else {
    return "Network error. Please check your connection.";
  }
};
