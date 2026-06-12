# FCM Web Push Notifications via Twilio Comms API

Minimal web app for testing FCM push notifications sent through the [Twilio Push Notifications API](https://www.twilio.com/docs/push-notifications).

## Setup

### 1. Create a Firebase project

1. Create a personal Gmail account (Twilio org accounts don't have Firebase project creation access)
2. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
3. Register a web app (no hosting needed)
4. Copy the `firebaseConfig` object

### 2. Get Firebase credentials

**VAPID key:**
- Project Settings > Cloud Messaging > Web Push certificates > Generate key pair

**Service account key:**
- Project Settings > Service accounts > Generate new private key
- Save the downloaded JSON file

### 3. Configure the app

Copy the Firebase config into `config.ts`:

```ts
export const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.firebasestorage.app',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};

export const vapidKey = 'your-vapid-key';
```

Also update `firebase-messaging-sw.js` with the same `firebaseConfig` values.

### 4. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:5173, click "Request Permission", and copy the token.

### 5. Upload FCM credentials to Twilio

```bash
# Base64 encode the service account JSON
cat your-service-account.json | base64 -b 0

# Upload to Twilio
curl -X POST 'https://comms.twilio.com/preview/PushNotifications/Credentials' \
  -H 'Content-Type: application/json' \
  -d '{
    "credentialType": "FCM",
    "content": {"privateKey": "BASE64_ENCODED_SERVICE_ACCOUNT_JSON"},
    "appName": "your_app_name"
  }' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

### 6. Send a test notification

```bash
curl -X POST 'https://comms.twilio.com/preview/PushNotifications' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": {"appName": "your_app_name"},
    "to": [{"token": "DEVICE_TOKEN", "provider": "FCM"}],
    "content": {"title": "Hello!", "body": "Push notifications are working"}
  }' \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

## Notes

- The `appName` in the credential upload must be lowercase with underscores only (regex: `^[a-z0-9_]+$`)
- The `privateKey` is the **entire service account JSON file** base64-encoded, not just the private key field
- If sending fails, make sure you specify `"from": {"appName": "..."}` matching the name used during credential upload
- Foreground messages appear in the app UI; background messages show as OS notifications
