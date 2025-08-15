// API Configuration following backend documentation

export const API_CONFIG = {
  development: "http://localhost:3000",
  production: "https://api.snaptoy.studio",
  timeout: 30000, // 30 seconds for image processing
};

export const API_BASE_URL = __DEV__
  ? API_CONFIG.development
  : API_CONFIG.production;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    apple: "/auth/apple",
    refresh: "/auth/refresh",
    validate: "/auth/validate",
  },

  // User Profile
  users: {
    me: "/api/users/me",
    credits: "/api/users/credits",
  },

  // Photo Transformation
  transform: {
    create: "/api/transform",
    history: "/api/transform/history",
    getById: (id: string) => `/api/transform/${id}`,
  },

  // Credits & Packages
  credits: {
    balance: "/api/users/credits",
    packages: "/api/packages",
    purchase: "/api/credits/purchase",
    subscription: "/api/credits/subscription",
    history: "/api/credits/history",
  },

  // System
  system: {
    health: "/health",
    info: "/",
  },
} as const;

// Background Types Configuration
export const BACKGROUND_TYPES = {
  cartoon: {
    id: "cartoon" as const,
    name: "Cartoon",
    description:
      "Vibrant cartoon illustration with bright colors and whimsical design",
    emoji: "🎨",
  },
  lego: {
    id: "lego" as const,
    name: "LEGO World",
    description:
      "Authentic LEGO brick environment with plastic textures and geometric shapes",
    emoji: "🧱",
  },
  photo: {
    id: "photo" as const,
    name: "Studio Photo",
    description: "Professional photographic background with natural lighting",
    emoji: "📸",
  },
} as const;

// Error Codes from backend documentation
export const API_ERROR_CODES = {
  // Authentication Errors
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  ACCESS_DENIED: "ACCESS_DENIED",

  // Validation Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NO_FILE: "NO_FILE",
  INVALID_IMAGE: "INVALID_IMAGE",
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",

  // Service Errors
  TRANSFORMATION_ERROR: "TRANSFORMATION_ERROR",
  PURCHASE_ERROR: "PURCHASE_ERROR",
  SUBSCRIPTION_ERROR: "SUBSCRIPTION_ERROR",

  // Network/Server Errors
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

// Credit Package Information (matches backend)
export const CREDIT_PACKAGES = {
  basic: {
    name: "Basic Pack",
    description: "Perfect for trying out SnapToy",
    credits: 8,
    price: 1.0,
    priceString: "$1.00",
    value: "starter",
    savings: undefined,
  },
  value: {
    name: "Value Pack",
    description: "Great value for regular users",
    credits: 17,
    price: 2.0,
    priceString: "$2.00",
    value: "popular",
    savings: "15% more credits",
  },
  pro: {
    name: "Pro Pack",
    description: "Best value for creative users",
    credits: 45,
    price: 5.0,
    priceString: "$5.00",
    value: "best",
    savings: "25% more credits",
  },
} as const;

// Subscription Tiers (for future use)
export const SUBSCRIPTION_TIERS = {
  none: {
    name: "Free",
    credits: 0,
    price: 0,
    duration: "none",
    features: ["Basic transformations"],
  },
  standard: {
    name: "Standard",
    credits: 8,
    price: 1.0,
    duration: "week",
    features: ["8 photos per week", "All background types", "Custom prompts"],
  },
  pro: {
    name: "Pro",
    credits: 40,
    price: 5.0,
    duration: "week",
    features: [
      "40 photos per week",
      "All background types",
      "Custom prompts",
      "Priority processing",
    ],
  },
} as const;
