import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@twilio-paste/core/theme';
import { Box } from '@twilio-paste/core/box';
import { Heading } from '@twilio-paste/core/heading';
import { Text } from '@twilio-paste/core/text';
import { Paragraph } from '@twilio-paste/core/paragraph';
import { Button } from '@twilio-paste/core/button';
import { Card } from '@twilio-paste/core/card';
import { Stack } from '@twilio-paste/core/stack';
import { Separator } from '@twilio-paste/core/separator';
import { Badge } from '@twilio-paste/core/badge';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Callout, CalloutHeading, CalloutText } from '@twilio-paste/core/callout';
import { Anchor } from '@twilio-paste/core/anchor';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './config';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>(Notification.permission);
  const [sendTitle, setSendTitle] = useState('Test Notification');
  const [sendBody, setSendBody] = useState('Sent via Twilio Push Notifications API');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    if (permissionState === 'granted') {
      getToken(messaging, { vapidKey })
        .then(setToken)
        .catch((err) => setError(err.message));
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      setMessages((prev) => [payload, ...prev]);
    });

    return unsubscribe;
  }, [permissionState]);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') {
        setError('Notification permission denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendTestPush = async () => {
    if (!token) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, title: sendTitle, body: sendBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult('Sent successfully!');
      } else {
        setSendResult(`Failed: ${data.errors?.[0]?.message || JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setSendResult(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Theme.Provider theme="default">
      <Box backgroundColor="colorBackgroundBody" minHeight="100vh" padding="space100">
        <Box maxWidth="720px" marginX="auto">
          <Stack orientation="vertical" spacing="space80">

            {/* Header */}
            <Box>
              <Heading as="h1" variant="heading10">
                Push Notifications Test
              </Heading>
              <Text as="p" color="colorTextWeak" fontSize="fontSize40">
                Test FCM web push notifications sent via the Twilio Comms API
              </Text>
            </Box>

            {/* Connection Status */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Heading as="h2" variant="heading30">
                  1. Connect
                </Heading>

                {permissionState !== 'granted' ? (
                  <>
                    <Box display="flex" alignItems="center" columnGap="space30">
                      <Badge as="span" variant="warning">Not Connected</Badge>
                    </Box>
                    <Paragraph>
                      Allow notifications to register this browser with FCM and receive push messages.
                    </Paragraph>
                    <Button variant="primary" onClick={requestPermission}>
                      Enable Notifications
                    </Button>
                  </>
                ) : (
                  <>
                    <Box display="flex" alignItems="center" columnGap="space30">
                      <Badge as="span" variant="success">Connected</Badge>
                    </Box>
                    {token && (
                      <Box>
                        <Label htmlFor="device-token">Device Token</Label>
                        <Input
                          id="device-token"
                          type="text"
                          value={token}
                          readOnly
                          onClick={(e: any) => {
                            e.target.select();
                            navigator.clipboard.writeText(token);
                          }}
                        />
                        <Text as="p" color="colorTextWeak" fontSize="fontSize20" marginTop="space20">
                          Click to copy. Use this token to target this browser when sending notifications.
                        </Text>
                      </Box>
                    )}
                  </>
                )}

                {error && (
                  <Callout variant="error">
                    <CalloutHeading as="h4">Error</CalloutHeading>
                    <CalloutText>{error}</CalloutText>
                  </Callout>
                )}
              </Stack>
            </Card>

            {/* Send Test */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Heading as="h2" variant="heading30">
                  2. Send a Test Push
                </Heading>
                <Paragraph>
                  Send a notification to this browser via the Twilio Push Notifications API.
                </Paragraph>
                <Box>
                  <Label htmlFor="send-title">Title</Label>
                  <Input
                    id="send-title"
                    type="text"
                    value={sendTitle}
                    onChange={(e) => setSendTitle(e.target.value)}
                  />
                </Box>
                <Box>
                  <Label htmlFor="send-body">Body</Label>
                  <Input
                    id="send-body"
                    type="text"
                    value={sendBody}
                    onChange={(e) => setSendBody(e.target.value)}
                  />
                </Box>
                <Button
                  variant="primary"
                  onClick={sendTestPush}
                  disabled={!token || sending}
                  loading={sending}
                >
                  Send Notification
                </Button>
                {sendResult && (
                  <Text as="p" color={sendResult.startsWith('Sent') ? 'colorTextSuccess' : 'colorTextError'}>
                    {sendResult}
                  </Text>
                )}
              </Stack>
            </Card>

            {/* Messages */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Heading as="h2" variant="heading30">
                  3. Message History
                </Heading>
                {messages.length === 0 ? (
                  <Text as="p" color="colorTextWeak">
                    No messages received yet. Send a push notification to see it here.
                  </Text>
                ) : (
                  <Stack orientation="vertical" spacing="space40">
                    {messages.map((msg, i) => (
                      <Box
                        key={i}
                        backgroundColor="colorBackgroundSuccessWeakest"
                        padding="space40"
                        borderRadius="borderRadius20"
                      >
                        <Text as="p" fontWeight="fontWeightSemibold">
                          {msg.notification?.title || msg.data?.title || 'Untitled'}
                        </Text>
                        <Text as="p" color="colorTextWeak">
                          {msg.notification?.body || msg.data?.body || JSON.stringify(msg.data)}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            <Separator orientation="horizontal" />

            {/* How It Works */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Heading as="h2" variant="heading30">
                  How It Works
                </Heading>

                <Box
                  backgroundColor="colorBackgroundWeak"
                  padding="space50"
                  borderRadius="borderRadius20"
                  fontFamily="fontFamilyCode"
                  fontSize="fontSize20"
                  whiteSpace="pre"
                  overflowX="auto"
                >
{`┌─────────────────────────────────────────────────────────────────────┐
│                          SEND FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐     ┌───────────────────┐     ┌─────────┐            │
│  │  "Send"  │────▶│  Twilio Comms API │────▶│  FCM    │            │
│  │  Button  │     │  /PushNotif...    │     │ (Google)│            │
│  └──────────┘     └───────────────────┘     └────┬────┘            │
│       │                                          │                  │
│       │ POST /api/send-test                      │ Push via HTTPS   │
│       │ (Vercel serverless fn)                   │                  │
│       │                                          ▼                  │
│       │           ┌──────────────────────────────────────┐          │
│       │           │         This Browser                 │          │
│       └──────────▶│  Service Worker receives push        │          │
│  (if tab focused) │  onMessage() updates UI              │          │
│                   └──────────────────────────────────────┘          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        REGISTRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐     ┌─────────┐     ┌────────────────────────┐       │
│  │ Browser  │────▶│  FCM    │────▶│ Returns Device Token   │       │
│  │ requests │     │ (Google)│     │ (used to target this   │       │
│  │ permission│    └─────────┘     │  specific browser)     │       │
│  └──────────┘         ▲           └────────────────────────┘       │
│                       │                                             │
│                  VAPID Key                                          │
│              (proves app identity)                                  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        SETUP (one-time)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Firebase Console ──▶ Service Account JSON ──▶ base64 encode        │
│                                                     │               │
│                                                     ▼               │
│                                          Twilio Comms API           │
│                                          POST /Credentials          │
│                                          (stored as "fcm_web_test") │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘`}
                </Box>

                <Heading as="h3" variant="heading40">
                  Want to send from your own Twilio account?
                </Heading>
                <Paragraph>
                  See the{' '}
                  <Anchor href="https://github.com/macarey/fcm-web-push-demo" showExternal>
                    README
                  </Anchor>{' '}
                  for instructions on uploading the Firebase service account key to your own
                  Twilio account as an FCM credential, then use the curl commands to send directly.
                </Paragraph>
              </Stack>
            </Card>

          </Stack>
        </Box>
      </Box>
    </Theme.Provider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
