// API Types matching backend documentation interfaces

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Authentication Types
export interface AppleSignInRequest {
  identityToken: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface UserResponse {
  publicId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photoCredits: number;
  subscriptionTier: "none" | "standard" | "pro";
  subscriptionEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  sessionToken: string;
}

// Photo Transformation Types
export interface PhotoTransformRequest {
  image: FormData; // multipart/form-data
  backgroundType: "cartoon" | "lego" | "photo";
  customPrompt?: string;
}

export interface PhotoTransformResponse {
  publicId: string;
  backgroundType: "cartoon" | "lego" | "photo";
  customPrompt?: string;
  status: "processing" | "completed" | "failed";
  resultImageUrl?: string;
  errorMessage?: string;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

// Credit System Types
export interface CreditPackageResponse {
  packageId: string;
  name: string;
  description?: string;
  credits: number;
  price: string;
  sortOrder: number;
}

export interface CreditPurchaseRequest {
  packageId: number;
  appleReceiptData?: string;
}

export interface CreditPurchaseResponse {
  publicId: string;
  creditsAdded: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  receiptData: string;
  createdAt: string;
}

export interface SubscriptionUpdateRequest {
  receiptData: string;
  subscriptionTier: "standard" | "pro";
}

export interface CreditBalanceResponse {
  photoCredits: number;
  subscriptionTier: "none" | "standard" | "pro";
  subscriptionEndsAt?: string;
  tierCredits: {
    none: number;
    standard: number;
    pro: number;
  };
}

// Error Types
export interface InsufficientCreditsError {
  creditsRequired: number;
  creditsAvailable: number;
  subscriptionTier: string;
}

// Query Parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface TransformHistoryParams extends PaginationParams {
  status?: "processing" | "completed" | "failed";
  backgroundType?: "cartoon" | "lego" | "photo";
}

// System Types
export interface HealthCheckResponse {
  status: "healthy";
  timestamp: string;
  uptime: number;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  documentation: string;
}
