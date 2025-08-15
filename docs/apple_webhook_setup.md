# Apple Sign in with Apple Webhook Setup Guide

## Overview

Apple requires your backend to provide a webhook endpoint that receives notifications about user account lifecycle events. This is crucial for maintaining data integrity and respecting user privacy choices.

## What This Webhook Handles

The SnapToy API now includes a comprehensive webhook endpoint at `/auth/apple/webhook` that handles:

### User Lifecycle Events

1. **`account-delete`** - User deleted their Apple ID or removed your app
2. **`email-disabled`** - User disabled email forwarding for private relay
3. **`email-enabled`** - User enabled email forwarding for private relay
4. **`consent-withdrawn`** - User withdrew consent for data sharing

## Webhook Endpoint Details

### **URL**: `https://your-domain.com/auth/apple/webhook`

- **Method**: POST
- **Content-Type**: `application/json`
- **Authentication**: JWT verification using Apple's public keys
- **TLS**: Requires TLS 1.2 or later (automatically provided by Fly.io)

### Request Format

Apple sends notifications as JSON data with a `signedPayload` field containing a JWT token:

```
POST /auth/apple/webhook
Content-Type: application/json

{
  "signedPayload": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6..."
}
```

### JWT Payload Structure

The JWT token contains:

```json
{
  "iss": "https://appleid.apple.com",
  "aud": "your.app.bundle.id",
  "iat": 1234567890,
  "type": "account-delete",
  "sub": "001234.abc123def456.1234",
  "email": "user@example.com",
  "is_private_email": true
}
```

## Setup Instructions

### 1. Environment Configuration

Ensure your `.env` file includes the Apple Client ID:

```env
# Apple Authentication
APPLE_TEAM_ID="your_team_id_here"
APPLE_KEY_ID="your_key_id_here"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
APPLE_CLIENT_ID="your_app_bundle_id_here"
```

**Important**: The `APPLE_CLIENT_ID` must match your app's bundle identifier.

### 2. Deploy Your Backend

Make sure your SnapToy API is deployed and accessible via HTTPS:

```bash
fly deploy
```

### 3. Register Webhook with Apple

1. **Log in to Apple Developer Console**
2. **Navigate to your App ID configuration**
3. **Find "Sign in with Apple" section**
4. **Add webhook URL**: `https://your-domain.com/auth/apple/webhook`
5. **Save configuration**

### 4. Verify Setup

Test the webhook endpoint is accessible:

```bash
curl -X POST https://your-domain.com/auth/apple/webhook \
  -H "Content-Type: application/json" \
  -d '{"signedPayload": "test"}'
```

You should receive a 400 error (expected, since we sent invalid payload), confirming the endpoint is reachable.

## How It Works

### 1. Apple Sends Notification

When a user performs an action (deletes account, changes email preferences), Apple automatically sends a POST request to your registered webhook URL.

### 2. JWT Verification

The SnapToy API:

1. Extracts the JWT token from the `signedPayload` field
2. Fetches Apple's current public keys
3. Verifies the JWT signature, issuer, and audience
4. Extracts the notification details

### 3. User Account Processing

Based on the notification type:

- **Account Deletion**: Deactivates the user account and anonymizes data
- **Email Changes**: Updates user email preferences
- **Consent Withdrawal**: Marks consent status for compliance

### 4. Database Updates

The system updates the user record in PostgreSQL to reflect the changes, maintaining data integrity.

## Security Features

### JWT Verification

- **Apple's Public Keys**: Real-time verification using Apple's rotating public keys
- **Signature Validation**: Cryptographic verification of webhook authenticity
- **Issuer Validation**: Ensures notifications come from Apple
- **Audience Validation**: Confirms notifications are for your app

### Data Protection

- **Minimal Logging**: Sensitive data is masked in logs
- **Secure Processing**: User data handled according to privacy requirements
- **Audit Trail**: All processing steps are logged for compliance

## User Privacy Compliance

### Account Deletion Handling

When Apple sends an `account-delete` notification, the system:

1. **Soft Deletes** the user account (recommended for analytics)
2. **Anonymizes** user data (email becomes `deleted_timestamp@deleted.snaptoy.app`)
3. **Clears** personal information (firstName, lastName set to null)
4. **Preserves** transformation history for business analytics

```typescript
// Example: Account deletion processing
await prisma.user.update({
  where: { id: userId },
  data: {
    isActive: false,
    email: `deleted_${Date.now()}@deleted.snaptoy.app`,
    firstName: null,
    lastName: null,
    updatedAt: new Date(),
  },
});
```

### Email Preference Changes

The system respects user email forwarding preferences for Apple's private relay service.

## Testing Your Webhook

### Local Testing with ngrok

For development testing:

1. **Install ngrok**: `brew install ngrok` (macOS)
2. **Expose local server**: `ngrok http 3000`
3. **Use ngrok URL**: `https://abc123.ngrok.io/auth/apple/webhook`
4. **Register with Apple Developer Console**

### Production Testing

Apple provides a testing interface in the Developer Console to send test notifications to your webhook.

## Monitoring and Debugging

### Log Monitoring

The webhook logs all processing steps:

```bash
# View webhook logs
fly logs --app snaptoy-api | grep "Apple webhook"
```

### Health Checks

The webhook endpoint is automatically monitored as part of your application health.

### Error Handling

Common issues and solutions:

1. **Invalid JWT**: Check `APPLE_CLIENT_ID` matches your bundle identifier
2. **Verification Failed**: Ensure Apple public keys are being fetched correctly
3. **User Not Found**: Normal for deleted users; webhook handles gracefully

## Legal and Compliance

### Privacy Requirements

- **User Consent**: Respect user privacy choices immediately
- **Data Retention**: Follow your privacy policy for data retention
- **Audit Trail**: Maintain records of privacy-related actions

### Apple Requirements

- **Response Time**: Webhook must respond within 30 seconds
- **HTTPS Only**: Apple only sends to HTTPS endpoints
- **Valid SSL**: Certificate must be valid and trusted

## Troubleshooting

### Common Issues

1. **404 Not Found**
   - Check webhook URL registration in Apple Developer Console
   - Verify endpoint is deployed and accessible

2. **JWT Verification Failed**
   - Confirm `APPLE_CLIENT_ID` environment variable is correct
   - Check Apple public key fetching in logs

3. **User Not Found**
   - Normal for already-deleted users
   - Check logs for user lookup attempts

### Debug Checklist

- [ ] Webhook URL registered with Apple Developer Console
- [ ] `APPLE_CLIENT_ID` environment variable set correctly
- [ ] Backend deployed and accessible via HTTPS
- [ ] Endpoint responds to test requests
- [ ] Logs show successful JWT verification

## API Reference

### Endpoint

```
POST /auth/apple/webhook
```

### Request Body

```json
Content-Type: application/json

{
  "signedPayload": "{jwt_token}"
}
```

### Response

**Success (200)**:

```json
{
  "success": true,
  "message": "Apple user lifecycle webhook processed."
}
```

**Error (400)**:

```json
{
  "success": false,
  "error": {
    "message": "Invalid request body.",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error (500)**:

```json
{
  "success": false,
  "error": {
    "message": "Failed to process Apple webhook",
    "code": "WEBHOOK_PROCESSING_ERROR"
  }
}
```

This webhook implementation ensures your SnapToy application maintains compliance with Apple's privacy requirements while providing a robust user lifecycle management system.
