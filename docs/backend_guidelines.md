# SnapToy Backend API Guide

## Frontend Integration Guide

This document provides complete frontend integration guidance for the SnapToy backend API. It covers authentication flows, API endpoints, request/response formats, and implementation patterns specifically designed for Expo React Native development.

## Quick Start for Frontend Developers

### Backend URLs

**Development:**

- Local: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`

**Production:**

- API Base: `https://api.snaptoy.studio`
- API Docs: `https://api.snaptoy.studio/api-docs`

### Core Integration Pattern

```typescript
// Recommended HTTP client setup for Expo
import axios from "axios";

const apiClient = axios.create({
  baseURL: __DEV__ ? "http://localhost:3000" : "https://api.snaptoy.studio",
  timeout: 30000, // 30 seconds for image processing
  headers: {
    "Content-Type": "application/json",
  },
});

// Add session token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getStoredSessionToken(); // Your token storage logic
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Architecture Principles

### Service Layer Architecture

- **Controllers:** Handle HTTP requests and responses
- **Services:** Contain business logic and data operations
- **Middleware:** Handle cross-cutting concerns (Apple auth, admin auth)
- **Types:** Centralized type definitions for SnapToy domain

**Implementation:** See directory structure in `src/modules/` for complete examples.

### Type Safety and Interface Management

#### Type Definition Rules

1. **All interfaces must be in dedicated type files** (`src/types/types.interface.ts`)
2. **No inline object type definitions** in function parameters
3. **Use defined interfaces** for all service options and data transfer

**Implementation:**

- Main interfaces: `src/types/types.interface.ts`
- Usage examples: All service functions use proper interfaces

#### Interface Organization

- **Service Options:** `TransformationServiceOptions`, `UserServiceOptions`, `AdminServiceOptions`
- **Request/Response:** `PhotoTransformRequest`, `CreditPurchaseRequest`, `AppleSignInRequest`
- **Authentication:** `AppleAuthRequest`, `AdminAuthRequest`
- **System:** `SystemStatsResponse`, `HealthCheckResponse`

**Implementation:** See complete interface definitions and their usage throughout the service layer.

#### Type Import Strategy

All modules import types from centralized type files, ensuring consistency and preventing duplication.

**Implementation:** Check import statements in any service or controller file for examples.

### Clean Service Functions

Services should be pure functions that handle business logic without manual response construction.

**Implementation:**

- Clean patterns: `src/modules/transform/transform.service.ts`
- Transform functions: `transformToResponse()`, `transformPurchaseResponse()`
- Error handling: Service functions throw errors, controllers handle responses

## Authentication System for Frontend

### Apple Sign-In Integration

The backend uses Apple Sign-In for user authentication. Here's how to integrate it in your Expo app:

#### 1. Expo Apple Authentication Setup

```bash
# Install required packages
npx expo install expo-apple-authentication
```

```typescript
// Apple Sign-In implementation
import * as AppleAuthentication from "expo-apple-authentication";

const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Send to your backend
    const response = await apiClient.post("/auth/apple", {
      identityToken: credential.identityToken,
      user: {
        firstName: credential.fullName?.givenName,
        lastName: credential.fullName?.familyName,
        email: credential.email,
      },
    });

    // Store session token
    await storeSessionToken(response.data.data.sessionToken);
    return response.data.data;
  } catch (error) {
    console.error("Apple Sign-In failed:", error);
    throw error;
  }
};
```

#### 2. Authentication Flow

**Frontend → Backend Flow:**

1. **Expo App**: User taps Apple Sign-In button
2. **Apple**: Returns identity token and user info
3. **Backend**: POST `/auth/apple` with identity token
4. **Backend**: Verifies token, creates/updates user, returns session JWT
5. **Expo App**: Stores session token for future API calls

#### 3. Session Management

```typescript
// Token storage (using Expo SecureStore)
import * as SecureStore from "expo-secure-store";

const storeSessionToken = async (token: string) => {
  await SecureStore.setItemAsync("sessionToken", token);
};

const getStoredSessionToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("sessionToken");
};

const clearSessionToken = async () => {
  await SecureStore.deleteItemAsync("sessionToken");
};

// Token refresh
const refreshToken = async () => {
  try {
    const response = await apiClient.post("/auth/refresh");
    await storeSessionToken(response.data.data.sessionToken);
    return response.data.data;
  } catch (error) {
    // Handle refresh failure - redirect to login
    await clearSessionToken();
    throw error;
  }
};
```

#### 4. Protected API Calls

All user endpoints require the session token in the Authorization header:

```typescript
// Automatic token inclusion (configured in axios interceptor above)
const getUserProfile = async () => {
  const response = await apiClient.get("/api/users/me");
  return response.data.data;
};

const getUserCredits = async () => {
  const response = await apiClient.get("/api/users/credits");
  return response.data.data;
};
```

### Security Patterns

- Public ID pattern for all external identifiers
- Input validation with Zod schemas
- Comprehensive error handling with sanitized responses

**Implementation:**

- Public IDs: Transform functions in service layer
- Validation: Route handlers with schema validation
- Error handling: `src/middleware/error.middleware.ts`

## Database Patterns

### Prisma Integration for SnapToy

- **SQLite**: Cost-effective single-instance deployment (production ready)
- **PostgreSQL**: Ready for scaling when needed (configurations preserved)
- Parameterized queries for security
- Proper indexing and relationships
- SnapToy-specific models: User, PhotoTransformation, CreditPurchase

**Implementation:**

- Database client: `src/config/db.ts`
- SQLite configuration: `file:../data/dev.db` for development
- Model operations: Throughout service layer
- Relationships: User transformations, credit purchases
- PostgreSQL migration: Simply change provider and DATABASE_URL when scaling

### Data Transform Pattern

Always transform database results to API response format using dedicated functions.

**Implementation:**

- Transform functions: `transformToResponse()`, `transformUserResponse()`, `transformPurchaseResponse()`
- Consistent usage: All service functions return transformed responses
- Type safety: Return types match interface definitions

## Photo Transformation for Frontend

### Image Processing Integration

The backend provides a complete photo transformation system using PhotoRoom's latest AI models. Here's how to integrate it in your Expo app:

#### 1. Image Selection Setup

```bash
# Install required packages
npx expo install expo-image-picker expo-camera
```

```typescript
// Image picker implementation
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Sorry, we need camera roll permissions to make this work!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8, // Optimize for upload
    base64: false, // We'll use FormData instead
  });

  return result.canceled ? null : result.assets[0];
};

const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("Sorry, we need camera permissions to make this work!");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: false,
  });

  return result.canceled ? null : result.assets[0];
};
```

#### 2. Photo Transformation API

```typescript
// Transform photo with background replacement
const transformPhoto = async (
  imageUri: string,
  backgroundType: "cartoon" | "lego" | "photo",
  customPrompt?: string
) => {
  try {
    // Create FormData for multipart upload
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

    const response = await apiClient.post("/api/transform", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data; // PhotoTransformResponse
  } catch (error) {
    if (error.response?.status === 402) {
      throw new Error(
        "Insufficient credits. Please purchase more credits or upgrade your subscription."
      );
    }
    throw error;
  }
};
```

#### 3. Background Types & Prompts

The backend supports three optimized background types:

```typescript
// Background type options for UI
const backgroundTypes = [
  {
    id: "cartoon",
    name: "Cartoon",
    description:
      "Vibrant cartoon illustration with bright colors and whimsical design",
    preview: require("./assets/cartoon-preview.png"),
  },
  {
    id: "lego",
    name: "LEGO World",
    description:
      "Authentic LEGO brick environment with plastic textures and geometric shapes",
    preview: require("./assets/lego-preview.png"),
  },
  {
    id: "photo",
    name: "Studio Photo",
    description: "Professional photographic background with natural lighting",
    preview: require("./assets/photo-preview.png"),
  },
];

// Custom prompt integration
const [customPrompt, setCustomPrompt] = useState("");
const [selectedBackground, setSelectedBackground] = useState("cartoon");

// Example prompts for user guidance
const examplePrompts = {
  cartoon: [
    "magical forest with sparkles",
    "outer space with planets and stars",
    "underwater world with colorful fish",
  ],
  lego: [
    "LEGO castle with knights",
    "LEGO city with cars and buildings",
    "LEGO pirate ship on the ocean",
  ],
  photo: [
    "cozy living room setting",
    "outdoor garden with flowers",
    "modern kitchen counter",
  ],
};
```

#### 4. Processing State Management

```typescript
// State management for transformation
const [isProcessing, setIsProcessing] = useState(false);
const [transformationResult, setTransformationResult] = useState(null);
const [error, setError] = useState(null);

const handleTransformation = async (imageUri: string, backgroundType: string) => {
  setIsProcessing(true);
  setError(null);

  try {
    const result = await transformPhoto(imageUri, backgroundType, customPrompt);
    setTransformationResult(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsProcessing(false);
  }
};

// UI feedback
{isProcessing && (
  <View style={styles.processingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text>Transforming your photo with AI...</Text>
    <Text>This may take up to 30 seconds</Text>
  </View>
)}
```

#### 5. Latest PhotoRoom Features

The backend uses PhotoRoom's newest Studio model with enhanced capabilities:

- **Studio Model**: Latest AI model for photorealistic results (`background-studio-beta-2025-03-17`)
- **Optimized Prompts**: Detailed prompts specifically crafted for toy photography
- **Consistent Results**: Uses recommended seeds for quality consistency
- **Enhanced Processing**: Better object shape definition and texture quality

**Benefits for Frontend:**

- **Higher Quality**: More realistic and detailed backgrounds
- **Better Props**: AI generates surrounding objects and context
- **Consistent Style**: Reproducible results across transformations

## Credits & Subscription System for Frontend

### Credit Management Integration

The backend provides a complete credit and subscription system. Here's how to integrate it in your Expo app:

#### 1. Credit Display Component

```typescript
// Credit counter component
import { useState, useEffect } from 'react';

const CreditCounter = () => {
  const [credits, setCredits] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState('none');

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await apiClient.get('/api/users/credits');
      setCredits(response.data.data.photoCredits);
      setSubscriptionTier(response.data.data.subscriptionTier);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  return (
    <View style={styles.creditContainer}>
      <Text style={styles.creditText}>📸 {credits} credits</Text>
      <Text style={styles.tierText}>{subscriptionTier.toUpperCase()} Plan</Text>
    </View>
  );
};
```

#### 2. Subscription Tiers

```typescript
// Subscription tier configuration
const subscriptionTiers = {
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
};

// Credit purchase options (fetched from backend)
const creditPackages = [
  {
    packageId: "basic_pack_uuid",
    name: "Basic Pack",
    description: "Perfect for trying out SnapToy",
    credits: 8,
    price: "1.00",
    sortOrder: 1,
  },
  {
    packageId: "value_pack_uuid",
    name: "Value Pack",
    description: "Great value for regular users",
    credits: 17,
    price: "2.00",
    sortOrder: 2,
  },
  {
    packageId: "pro_pack_uuid",
    name: "Pro Pack",
    description: "Best value for creative users",
    credits: 45,
    price: "5.00",
    sortOrder: 3,
  },
];
```

#### 3. Fetch Available Credit Packages

```typescript
// Get available credit packages from backend
const getAvailablePackages = async () => {
  try {
    const response = await apiClient.get("/api/packages");
    return response.data.data; // Array of CreditPackageResponse
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
};

// Usage in component
const [packages, setPackages] = useState([]);

useEffect(() => {
  const loadPackages = async () => {
    const availablePackages = await getAvailablePackages();
    setPackages(availablePackages);
  };
  loadPackages();
}, []);
```

#### 4. Apple In-App Purchases Integration

```bash
# Install required packages
npx expo install expo-store-kit
```

```typescript
// In-app purchase implementation
import * as StoreKit from "expo-store-kit";

const purchaseCredits = async (packageId: number, productId: string) => {
  try {
    // Request purchase from Apple
    const result = await StoreKit.requestPurchase({
      productId,
    });

    if (result.responseCode === StoreKit.IAPResponseCode.OK) {
      // Send receipt to backend for validation
      const response = await apiClient.post("/api/credits/purchase", {
        packageId, // Reference to backend credit package
        appleReceiptData: result.receipt,
      });

      // Update local credit count
      await fetchUserCredits();
      return response.data.data;
    }
  } catch (error) {
    console.error("Purchase failed:", error);
    throw error;
  }
};

const upgradeSubscription = async (tier: "standard" | "pro") => {
  try {
    const productId = `snaptoy_${tier}_weekly`;
    const result = await StoreKit.requestPurchase({
      productId,
    });

    if (result.responseCode === StoreKit.IAPResponseCode.OK) {
      // Send receipt to backend
      const response = await apiClient.put("/api/credits/subscription", {
        receiptData: result.receipt,
        subscriptionTier: tier,
      });

      return response.data.data;
    }
  } catch (error) {
    console.error("Subscription upgrade failed:", error);
    throw error;
  }
};
```

#### 5. Credit Check & Purchase Flow

```typescript
// Credit validation before transformation
const validateCreditsForTransformation = async () => {
  try {
    const response = await apiClient.get('/api/users/credits');
    const { photoCredits, subscriptionTier } = response.data.data;

    if (photoCredits < 1) {
      // Show purchase options
      return {
        hasCredits: false,
        options: [
          {
            type: 'subscription',
            tier: subscriptionTier === 'none' ? 'standard' : 'pro',
            message: `Upgrade to ${subscriptionTier === 'none' ? 'Standard' : 'Pro'} for weekly credits`,
          },
          {
            type: 'purchase',
            package: 'credits_7',
            message: 'Buy 7 credits for $1.00',
          },
        ],
      };
    }

    return { hasCredits: true };
  } catch (error) {
    throw error;
  }
};

// Purchase flow UI
const PurchaseModal = ({ visible, onClose, options }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.purchaseContainer}>
        <Text style={styles.title}>Need More Credits</Text>
        <Text style={styles.subtitle}>
          You need 1 credit to transform a photo
        </Text>

        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handlePurchase(option)}
          >
            <Text style={styles.optionText}>{option.message}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

#### 6. Purchase History & Analytics

```typescript
// Purchase history for user
const getPurchaseHistory = async () => {
  try {
    const response = await apiClient.get('/api/credits/history');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch purchase history:', error);
    return [];
  }
};

// Transformation history
const getTransformationHistory = async () => {
  try {
    const response = await apiClient.get('/api/transform/history');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch transformation history:', error);
    return [];
  }
};

// Usage analytics for user dashboard
const UsageAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const [purchases, transformations] = await Promise.all([
        getPurchaseHistory(),
        getTransformationHistory(),
      ]);

      setStats({
        totalTransformations: transformations.length,
        totalSpent: purchases.reduce((sum, p) => sum + p.amount, 0),
        favoriteBackground: getMostUsedBackground(transformations),
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  return (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>Your SnapToy Stats</Text>
      {stats && (
        <>
          <Text>📊 {stats.totalTransformations} photos transformed</Text>
          <Text>💰 ${stats.totalSpent.toFixed(2)} total spent</Text>
          <Text>🎨 Favorite style: {stats.favoriteBackground}</Text>
        </>
      )}
    </View>
  );
};
```

## API Design Standards

### API Documentation and Structure

The complete API structure is documented and explorable via an interactive OpenAPI (Swagger) interface. The specification is generated automatically from JSDoc comments in the route files.

**Accessing the Documentation:**

- **Interactive UI**: Navigate to `/api-docs` when the server is running
- **JSON Specification**: The raw OpenAPI 3.0 spec is available at `/api-docs.json`

**Using with Postman:**

1. Start the backend server (`npm run dev`)
2. In Postman, click **Import** > **From URL**
3. Enter `http://localhost:3000/api-docs.json`
4. Postman will create a collection from the specification

### Response Format

Consistent API response structure across all endpoints.

**Implementation:**

- Standard format: Check any controller response
- Error responses: `src/middleware/error.middleware.ts`
- Success responses: Service layer returns data, controllers wrap in standard format

### Error Handling

- Global error middleware
- Custom error classes
- Environment-appropriate error details

**Implementation:**

- Error middleware: `src/middleware/error.middleware.ts`
- Custom errors: `AppError`, `ValidationError`, `AuthError` classes
- Usage: Controllers use `asyncHandler` wrapper

### Route Organization

- Public routes (health, docs, Apple sign-in)
- Protected routes (Apple authentication required)
- Admin routes (admin JWT authentication)
- Webhook routes (Apple subscription webhooks)

**Implementation:**

- Route mounting: `src/index.ts`
- Route definitions: Individual route files in modules
- Middleware application: Auth middleware before protected routes

## Complete API Reference for Frontend

### Response Format Standards

All API endpoints follow a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string; details?: any };
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
```

### Authentication Endpoints

#### POST `/auth/apple` - Apple Sign-In

```typescript
// Request
{
  identityToken: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Response
{
  success: true,
  data: {
    user: {
      publicId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      photoCredits: number;
      subscriptionTier: 'none' | 'standard' | 'pro';
      subscriptionEndsAt?: string;
    },
    sessionToken: string;
  }
}
```

#### POST `/auth/refresh` - Refresh Session Token

```typescript
// Request: Include Authorization header with current token
// Response: Same as `/auth/apple`
```

#### GET `/auth/validate` - Validate Session Token

```typescript
// Response
{
  success: true,
  data: {
    valid: boolean;
    user?: UserResponse;
  }
}
```

### User Profile Endpoints

#### GET `/api/users/me` - Get Current User

```typescript
// Response
{
  success: true,
  data: {
    publicId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    photoCredits: number;
    subscriptionTier: 'none' | 'standard' | 'pro';
    subscriptionEndsAt?: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

#### PUT `/api/users/me` - Update User Profile

```typescript
// Request
{
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Response: Same as GET `/api/users/me`
```

#### GET `/api/users/credits` - Get Credit Balance

```typescript
// Response
{
  success: true,
  data: {
    photoCredits: number;
    subscriptionTier: 'none' | 'standard' | 'pro';
    subscriptionEndsAt?: string;
    tierCredits: {
      none: 0;
      standard: 8;
      pro: 40;
    };
  }
}
```

### Photo Transformation Endpoints

#### POST `/api/transform` - Transform Photo

```typescript
// Request: multipart/form-data
// FormData fields:
// - image: File (JPEG, PNG, GIF, WebP, max 10MB)
// - backgroundType: 'cartoon' | 'lego' | 'photo'
// - customPrompt?: string (max 200 chars)

// Response
{
  success: true,
  data: {
    publicId: string;
    backgroundType: 'cartoon' | 'lego' | 'photo';
    customPrompt?: string;
    status: 'processing' | 'completed' | 'failed';
    resultImageUrl?: string;
    errorMessage?: string;
    creditsUsed: number;
    createdAt: string;
    updatedAt: string;
  }
}

// Error Response (Insufficient Credits)
{
  success: false,
  error: {
    message: "Insufficient credits. You need 1 credit to transform a photo.",
    code: "INSUFFICIENT_CREDITS"
  },
  data: {
    creditsRequired: 1,
    creditsAvailable: 0,
    subscriptionTier: "none"
  }
}
```

#### GET `/api/transform/history` - Get Transformation History

```typescript
// Query Parameters:
// - status?: 'processing' | 'completed' | 'failed'
// - backgroundType?: 'cartoon' | 'lego' | 'photo'
// - limit?: number (max 100, default 20)
// - offset?: number (default 0)

// Response
{
  success: true,
  data: [
    {
      publicId: string;
      backgroundType: 'cartoon' | 'lego' | 'photo';
      customPrompt?: string;
      status: 'processing' | 'completed' | 'failed';
      resultImageUrl?: string;
      creditsUsed: number;
      createdAt: string;
    }
  ],
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}
```

#### GET `/api/transform/:id` - Get Specific Transformation

```typescript
// Response: Same format as POST `/api/transform`
```

### Credit & Subscription Endpoints

#### GET `/api/packages` - Get Available Credit Packages

```typescript
// Response
{
  success: true,
  data: [
    {
      packageId: string; // Public ID of the package
      name: string; // e.g., "Basic Pack"
      description?: string; // e.g., "Perfect for trying out SnapToy"
      credits: number; // e.g., 8
      price: string; // e.g., "1.00"
      sortOrder: number; // e.g., 1
    }
  ]
}
```

#### POST `/api/credits/purchase` - Purchase Credits

```typescript
// Request
{
  packageId: number; // ID of the credit package to purchase
  appleReceiptData?: string; // Apple receipt data for validation
}

// Response
{
  success: true,
  data: {
    publicId: string;
    creditsAdded: number;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    receiptData: string;
    createdAt: string;
  }
}
```

#### PUT `/api/credits/subscription` - Update Subscription

```typescript
// Request
{
  receiptData: string; // Apple subscription receipt
  subscriptionTier: "standard" | "pro";
}

// Response: Same as GET `/api/users/credits`
```

#### GET `/api/credits/history` - Get Purchase History

```typescript
// Query Parameters:
// - limit?: number (max 100, default 20)
// - offset?: number (default 0)

// Response
{
  success: true,
  data: [
    {
      publicId: string;
      creditsAdded: number;
      amount: number;
      status: 'pending' | 'completed' | 'failed';
      receiptData: string;
      createdAt: string;
    }
  ],
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}
```

### Public Endpoints

#### GET `/` - API Information

```typescript
// Response
{
  success: true,
  data: {
    name: "SnapToy API";
    version: "1.0.0";
    description: "AI-powered photo transformation service";
    documentation: "/api-docs";
  }
}
```

#### GET `/health` - Health Check

```typescript
// Response
{
  success: true,
  data: {
    status: "healthy";
    timestamp: string;
    uptime: number;
  }
}
```

### Query Parameters

**Pagination Parameters (where applicable):**

- `limit` (number): Items per page (max 100, default 20)
- `offset` (number): Skip items (default 0)

**Transformation History Parameters:**

- `status` (string): Filter by status (processing, completed, failed)
- `backgroundType` (string): Filter by background type (cartoon, lego, photo)

**Purchase History Parameters:**

- `limit` (number): Records per page (max 100, default 20)
- `offset` (number): Skip records (default 0)

### Error Handling for Frontend

#### Common Error Codes & Responses

```typescript
// Error response format
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  data?: any; // Additional context for specific errors
}

// Error handling utility
const handleApiError = (error: any) => {
  if (error.response?.data?.error) {
    const { code, message, details } = error.response.data.error;

    switch (code) {
      case "AUTHENTICATION_REQUIRED":
        // Redirect to login
        navigateToLogin();
        break;

      case "INVALID_TOKEN":
        // Try to refresh token, if that fails, redirect to login
        tryRefreshToken().catch(() => navigateToLogin());
        break;

      case "INSUFFICIENT_CREDITS":
        // Show purchase modal
        showPurchaseModal(error.response.data.data);
        break;

      case "INVALID_IMAGE":
        // Show user-friendly image error
        showToast(`Image error: ${message}`);
        break;

      case "TRANSFORMATION_ERROR":
        // Show transformation failure message
        showToast("Photo transformation failed. Please try again.");
        break;

      default:
        // Generic error handling
        showToast(message || "Something went wrong. Please try again.");
    }
  } else {
    // Network or other errors
    showToast("Network error. Please check your connection.");
  }
};
```

#### Error Code Reference

**Authentication Errors:**

- `AUTHENTICATION_REQUIRED` - No session token provided
- `INVALID_TOKEN` - Session token expired or invalid
- `ACCESS_DENIED` - Insufficient permissions

**Validation Errors:**

- `VALIDATION_ERROR` - Invalid request data format
- `NO_FILE` - No image file provided for transformation
- `INVALID_IMAGE` - Invalid image format, size, or corrupted file
- `INSUFFICIENT_CREDITS` - Not enough credits for transformation

**Service Errors:**

- `TRANSFORMATION_ERROR` - PhotoRoom API error or processing failure
- `PURCHASE_ERROR` - Apple receipt validation or credit purchase failed
- `SUBSCRIPTION_ERROR` - Subscription update or validation failed

**Network/Server Errors:**

- `RATE_LIMITED` - Too many requests, try again later
- `SERVER_ERROR` - Internal server error, try again later
- `SERVICE_UNAVAILABLE` - PhotoRoom or Apple services temporarily unavailable

## Development Setup & Environment

### Local Development Setup

#### Prerequisites

```bash
# Required tools
- Node.js 18+
- npm or yarn
- Git

# Optional (for full local setup)
- Docker & Docker Compose
```

#### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd snaptoy-api

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your API keys (see below)
# Start development server
npm run dev

# Backend will be available at http://localhost:3000
# API docs at http://localhost:3000/api-docs
```

### Environment Configuration

#### Required Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite for development)
DATABASE_URL="file:../data/dev.db"

# Apple Authentication (get from Apple Developer Console)
APPLE_TEAM_ID="YOUR_APPLE_TEAM_ID"
APPLE_KEY_ID="YOUR_APPLE_KEY_ID"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_APPLE_PRIVATE_KEY_CONTENT
-----END PRIVATE KEY-----"
APPLE_CLIENT_ID="YOUR_APP_BUNDLE_ID"

# PhotoRoom API (get from PhotoRoom dashboard)
PHOTOROOM_API_KEY="sandbox_sk_pr_..."  # Use sandbox for development

# Security
JWT_SECRET="your-super-secure-jwt-secret-256-bits-minimum"
BACKEND_SECRET_KEY="another-long-random-string-for-backend-auth"

# Application
NODE_ENV="development"
PORT=3000
API_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3001,http://localhost:19006,http://localhost:8081"

# Apple Webhook Secret (for App Store Server Notifications)
APPLE_WEBHOOK_SECRET="same-as-apple-private-key-for-now"
```

#### Getting API Keys

**Apple Developer Keys:**

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new Key for Sign in with Apple
4. Download the .p8 file and convert to PEM format
5. Note the Key ID and Team ID

**PhotoRoom API Key:**

1. Sign up at [PhotoRoom Developers](https://www.photoroom.com/api)
2. Create a new project
3. Get your sandbox API key for development
4. Upgrade to production key when ready to deploy

#### Environment Differences

**Development:**

- SQLite database (`file:../data/dev.db`)
- Sandbox PhotoRoom API
- Permissive CORS for localhost
- Verbose logging
- Apple sandbox receipt validation

**Production:**

- Custom domain CORS (`https://api.snaptoy.studio`)
- Production PhotoRoom API
- Minimal logging
- Real Apple receipt validation
- Optional: PostgreSQL for high traffic

### Docker Development

#### Using Docker Compose (Recommended)

```bash
# Start all services (includes database)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Manual Docker Build

```bash
# Build image
docker build -t snaptoy-api .

# Run container
docker run -p 3000:3000 --env-file .env snaptoy-api
```

### Development Scripts

```bash
# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database

# Production build
npm run build
npm start

# Testing
npm test              # Run tests (when available)
```

### CORS Configuration

**CORS Security Levels:**

**Development Mode:**

- Allows localhost origins on common ports (3001, 19006 for React Native)
- Permissive for development tools
- Full error details in responses

**Production Mode:**

- Strict origin whitelist from `CORS_ORIGINS`
- Secure cookie settings for admin auth
- Sanitized error responses

**Implementation:**

- CORS config: `src/index.ts` with environment-based settings
- Origin validation: Dynamic origin checking
- Credentials: Enabled for admin cookie authentication

## Development Patterns

### Environment Configuration

- Separate dev/production configurations
- Required environment variable validation
- Secure defaults

**Implementation:**

- Environment loading: `src/index.ts`
- Configuration: Database and service configuration files
- Validation: Startup environment checks

### Logging Strategy

- Structured logging with pino
- Security event tracking
- Performance monitoring
- PhotoRoom API interaction logging

**Implementation:**

- Logger config: `src/config/logger.ts`
- Usage patterns: Throughout all service and controller files
- Security logging: Apple authentication and admin action logging

### Error Resilience

- Graceful error handling
- Database connection retry
- Service health checks
- PhotoRoom API fallback strategies

**Implementation:**

- Health checks: `/health` endpoint in main server file
- Error handling: Global error middleware
- Connection management: Database configuration with reconnection

## File Structure & Code Organization

### Complete Directory Structure

```
src/
├── auth/                          # Apple authentication routes
│   ├── apple.routes.ts           # Apple Sign-In endpoints (/auth/apple/*)
│   └── admin.routes.ts           # Admin JWT authentication (keep for management)
├── config/                        # Application configuration
│   ├── cors.ts                   # Centralized CORS configuration
│   ├── db.ts                     # Prisma database client & health checks
│   └── logger.ts                 # Structured logging with pino
├── middleware/                    # Express middleware
│   ├── apple-auth.middleware.ts  # Apple user authentication & credit checks
│   ├── auth.middleware.ts        # Admin JWT token validation
│   └── error.middleware.ts       # Global error handling & async wrapper
├── modules/                       # Feature-based modules
│   ├── admin/                    # Admin management (keep for backend admin)
│   │   ├── admin.controller.ts   # Admin CRUD & system stats controllers
│   │   ├── admin.routes.ts       # Admin management routes (/api/admin/*)
│   │   ├── admin.service.ts      # Admin business logic & data operations
│   │   ├── health.controller.ts  # System health monitoring
│   │   └── health.routes.ts      # Health monitoring routes (/api/admin/system/*)
│   ├── credits/                  # Credit and subscription management
│   │   ├── credits.controller.ts # Credit purchase and subscription controllers
│   │   ├── credits.routes.ts     # Credit routes (/api/credits/*)
│   │   └── credits.service.ts    # Credit business logic & Apple integration
│   ├── info/                     # System information
│   │   ├── info.controller.ts    # Health checks, API info, documentation
│   │   └── info.routes.ts        # Public info routes (/, /health)
│   ├── transform/                # Photo transformation (NEW)
│   │   ├── transform.controller.ts # Photo upload and transformation controllers
│   │   ├── transform.routes.ts   # Transform routes (/api/transform/*)
│   │   └── transform.service.ts  # PhotoRoom integration & transformation logic
│   └── users/                    # User management (Apple auth)
│       ├── user.controller.ts    # User profile and credit controllers
│       └── user.routes.ts        # User routes (/api/users/*)
├── services/                      # Application services
│   ├── apple-auth.service.ts     # Apple Sign-In token verification
│   └── photoroom.service.ts      # PhotoRoom API integration
├── types/                         # TypeScript type definitions
│   └── types.interface.ts        # SnapToy API interfaces & types
└── index.ts                      # Application entry point & route mounting
```

### Module Responsibility Matrix

| Module                 | Purpose                             | Authentication | Key Endpoints                  |
| ---------------------- | ----------------------------------- | -------------- | ------------------------------ |
| **auth/**              | Apple Sign-In authentication flows  | Public/JWT     | `/auth/apple`, `/auth/refresh` |
| **modules/admin/**     | Backend admin management            | Admin JWT      | `/api/admin/*`                 |
| **modules/credits/**   | Credit and subscription management  | Apple Auth     | `/api/credits/*`               |
| **modules/info/**      | System information & health         | Public         | `/`, `/health`                 |
| **modules/transform/** | Photo transformation with PhotoRoom | Apple Auth     | `/api/transform/*`             |
| **modules/users/**     | User profile management             | Apple Auth     | `/api/users/*`                 |

### Authentication Layers

**Public Routes (No Auth):**

- `src/modules/info/` - System information, health checks, API documentation
- `src/auth/apple.routes.ts` - Apple Sign-In and token management
- `src/auth/admin.routes.ts` - Admin login/logout endpoints

**Apple Authentication (User JWT):**

- `src/modules/users/user.routes.ts` - User self-service routes
- `src/modules/transform/transform.routes.ts` - Photo transformation
- `src/modules/credits/credits.routes.ts` - Credit management

**Admin Authentication (Local JWT):**

- `src/modules/admin/admin.routes.ts` - Admin operations
- Admin stats routes in transform and credits modules

**Webhook Authentication (Apple Signatures):**

- `src/modules/credits/credits.routes.ts` - Apple subscription webhooks

## Performance Considerations

### Database Optimization

- Efficient queries with proper field selection
- Index utilization on frequently queried fields
- Connection pooling

**Implementation:** See database queries in service layer with field selection and indexing.

### PhotoRoom API Optimization

- Image validation before API calls
- Proper timeout handling (30 seconds)
- Error retry strategies
- Response caching for repeated requests

**Implementation:**

- Validation: Image size and format checks
- Timeouts: Axios configuration in PhotoRoom service
- Error handling: Comprehensive error mapping

### API Performance

- Response transformation for consistent API format
- Error handling with proper status codes
- Request validation to prevent invalid processing

**Implementation:**

- Response patterns: Service layer transform functions
- Error middleware: Centralized error handling
- Validation: Input validation throughout API

## Best Practices

### Code Quality

1. **Use TypeScript strictly** with proper type definitions
2. **Centralize type definitions** in dedicated files
3. **Implement proper error handling** at all layers
4. **Use consistent naming conventions** across modules
5. **Follow separation of concerns** between layers

### Security

1. **Never expose internal database IDs** in APIs
2. **Validate all inputs** with schema validation
3. **Use proper Apple authentication** for all protected routes
4. **Implement credit checks** for paid operations
5. **Log security events** for monitoring

### Performance

1. **Optimize PhotoRoom API calls** with proper validation
2. **Use efficient database queries** with field selection
3. **Implement proper caching** where appropriate
4. **Monitor resource usage** and optimize bottlenecks
5. **Use connection pooling** for database operations

### Maintainability

1. **Document complex business logic** in services
2. **Use consistent error handling** patterns
3. **Implement comprehensive logging** for debugging
4. **Follow modular architecture** for easy maintenance
5. **Keep dependencies updated** and secure

## Apple Integration Best Practices

### Authentication

1. **Verify tokens properly** using Apple's public keys
2. **Handle token expiration** gracefully
3. **Store minimal user data** required for functionality
4. **Implement proper session management**

### Subscriptions

1. **Validate receipts** with Apple's servers
2. **Handle webhook failures** with retry logic
3. **Maintain subscription state** accurately
4. **Provide clear upgrade paths** for users

## PhotoRoom Integration Best Practices

### Image Processing

1. **Validate images** before sending to API
2. **Handle API limits** and quotas properly
3. **Implement retry logic** for transient failures
4. **Monitor processing costs** and usage

### Prompt Engineering

1. **Use optimized prompts** for each background type
2. **Allow custom prompts** with proper validation
3. **Test prompt variations** for quality
4. **Cache successful prompts** for reuse

## Frontend Integration Checklist

### Essential Expo Packages

```bash
# Core functionality
npx expo install expo-apple-authentication
npx expo install expo-image-picker
npx expo install expo-camera
npx expo install expo-secure-store
npx expo install expo-store-kit

# HTTP client
npm install axios

# Optional: State management
npm install @reduxjs/toolkit react-redux
# Or: npm install zustand
```

### Implementation Flow

#### 1. Authentication Setup ✅

- [ ] Install `expo-apple-authentication`
- [ ] Implement Apple Sign-In flow
- [ ] Setup secure token storage with `expo-secure-store`
- [ ] Configure axios interceptors for automatic token inclusion
- [ ] Implement token refresh logic

#### 2. Image Handling ✅

- [ ] Install `expo-image-picker` and `expo-camera`
- [ ] Request camera and photo library permissions
- [ ] Implement image selection (camera/gallery)
- [ ] Setup FormData for multipart uploads
- [ ] Add image validation (size, format)

#### 3. Photo Transformation ✅

- [ ] Create transformation API integration
- [ ] Implement background type selection UI
- [ ] Add custom prompt input with examples
- [ ] Setup processing state management
- [ ] Handle transformation results and errors

#### 4. Credit System ✅

- [ ] Install `expo-store-kit` for in-app purchases
- [ ] Implement credit counter display
- [ ] Setup subscription tier management
- [ ] Add purchase validation flow
- [ ] Implement credit check before transformations

#### 5. Error Handling ✅

- [ ] Setup global error handler
- [ ] Implement specific error code handling
- [ ] Add user-friendly error messages
- [ ] Setup offline handling
- [ ] Add retry mechanisms

### Key Integration Points

#### Backend URLs

```typescript
const API_CONFIG = {
  development: "http://localhost:3000",
  production: "https://api.snaptoy.studio",
  docs: "/api-docs",
};
```

#### Core API Endpoints

- **Authentication**: `POST /auth/apple`, `POST /auth/refresh`
- **User Profile**: `GET /api/users/me`, `GET /api/users/credits`
- **Transformation**: `POST /api/transform`, `GET /api/transform/history`
- **Credits**: `GET /api/packages`, `POST /api/credits/purchase`, `PUT /api/credits/subscription`

#### PhotoRoom Features

- **Latest AI Model**: Studio model for highest quality results
- **Three Background Types**: Cartoon, LEGO, Photo with optimized prompts
- **Custom Prompts**: User-defined background descriptions (max 200 chars)
- **Processing Time**: Up to 30 seconds per transformation

#### Credit System

- **Usage**: 1 credit per photo transformation
- **Flexible Packages**:
  - Basic Pack: 8 credits for $1.00
  - Value Pack: 17 credits for $2.00
  - Pro Pack: 45 credits for $5.00
- **Subscription Tiers** (optional, not currently active):
  - Standard: 8 credits/week ($1.00)
  - Pro: 40 credits/week ($5.00)

---

## 🎯 **Backend Features Summary**

### For Frontend Developers

- ✅ **Complete Apple Sign-In**: Ready-to-use authentication with session management
- ✅ **Latest PhotoRoom AI**: Studio model with optimized prompts for toy photography
- ✅ **Flexible Credit System**: Usage-based monetization with Apple In-App Purchases
- ✅ **Type-Safe API**: Comprehensive TypeScript interfaces for all endpoints
- ✅ **Error Handling**: Detailed error codes with frontend-friendly messages
- ✅ **Real-Time Processing**: 30-second image transformation with status updates
- ✅ **Production Ready**: Deployed at `https://api.snaptoy.studio` with full documentation

### Development Support

- 📚 **Interactive Docs**: Full API documentation at `/api-docs`
- 🔧 **Development Tools**: Hot reload, TypeScript checking, linting
- 🐳 **Docker Support**: Container-based development environment
- 📊 **Comprehensive Logging**: Structured logs for debugging
- 🔒 **Security First**: Apple authentication with JWT sessions
- 🚀 **Scalable Architecture**: SQLite for development, PostgreSQL ready for production

**This backend provides everything your Expo frontend needs for a professional AI-powered photo transformation app!** 🎉
