export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  appleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppleAuthCredential {
  identityToken: string;
  user?: string;
  email?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}
