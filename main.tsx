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

// ─── Flow Diagram ────────────────────────────────────────────────────────────

function FlowNode({ x, y, width = 140, height = 52, label, sublabel, accent = false }: {
  x: number; y: number; width?: number; height?: number;
  label: string; sublabel?: string; accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x - width / 2} y={y - height / 2}
        width={width} height={height}
        rx={8}
        fill={accent ? '#0263E0' : '#F4F4F6'}
        stroke={accent ? '#0263E0' : '#C9CDD3'}
        strokeWidth={1.5}
      />
      <text
        x={x} y={sublabel ? y - 7 : y + 5}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fontFamily="'Inter', sans-serif"
        fill={accent ? '#fff' : '#121C2D'}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x} y={y + 11}
          textAnchor="middle"
          fontSize={10.5}
          fontFamily="'Inter', sans-serif"
          fill={accent ? 'rgba(255,255,255,0.75)' : '#606B85'}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#C9CDD3" />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#C9CDD3" strokeWidth={1.5}
        markerEnd="url(#arrow)"
        strokeDasharray={label ? '5,3' : undefined}
      />
      {label && (
        <text x={mx} y={my - 6} textAnchor="middle" fontSize={10} fontFamily="'Inter', sans-serif" fill="#606B85">
          {label}
        </text>
      )}
    </g>
  );
}

function FlowDiagram() {
  return (
    <Box overflowX="auto">
      <Box as="div" style={{ minWidth: '560px' }}>
        {/* Send Flow */}
        <Text as="p" fontWeight="fontWeightSemibold" fontSize="fontSize20" color="colorTextWeak" marginBottom="space30">
          SEND FLOW
        </Text>
        <svg width="100%" viewBox="0 0 680 120" style={{ display: 'block', marginBottom: '8px' }}>
          <FlowNode x={70}  y={60} label="Send Button" sublabel="This browser" accent />
          <Arrow x1={142} y1={60} x2={208} y2={60} label="POST /api/send-test" />
          <FlowNode x={290} y={60} label="Vercel Fn" sublabel="/api/send-test" />
          <Arrow x1={362} y1={60} x2={428} y2={60} label="Twilio creds" />
          <FlowNode x={510} y={60} label="Twilio Comms API" sublabel="/PushNotifications" width={160} />
          <Arrow x1={590} y1={60} x2={650} y2={60} />
          <FlowNode x={660} y={60} label="FCM" sublabel="Google" width={70} />
          {/* loopback arrow */}
          <path d="M 660 87 Q 660 108 340 108 Q 70 108 70 87" fill="none" stroke="#C9CDD3" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arrow)" />
          <text x={340} y={106} textAnchor="middle" fontSize={10} fontFamily="'Inter', sans-serif" fill="#606B85">delivers to browser</text>
        </svg>

        {/* Registration Flow */}
        <Text as="p" fontWeight="fontWeightSemibold" fontSize="fontSize20" color="colorTextWeak" marginBottom="space30" marginTop="space50">
          REGISTRATION FLOW
        </Text>
        <svg width="100%" viewBox="0 0 680 120" style={{ display: 'block', marginBottom: '8px' }}>
          <FlowNode x={90}  y={60} label="Browser" sublabel="requests permission" accent />
          <Arrow x1={162} y1={60} x2={258} y2={60} label="VAPID key" />
          <FlowNode x={340} y={60} label="FCM (Google)" sublabel="validates app identity" width={160} />
          <Arrow x1={422} y1={60} x2={558} y2={60} label="device token" />
          <FlowNode x={610} y={60} label="Device Token" sublabel="targets this browser" width={120} />
        </svg>

        {/* One-time Setup */}
        <Text as="p" fontWeight="fontWeightSemibold" fontSize="fontSize20" color="colorTextWeak" marginBottom="space30" marginTop="space50">
          ONE-TIME SETUP
        </Text>
        <svg width="100%" viewBox="0 0 680 100" style={{ display: 'block' }}>
          <FlowNode x={90}  y={50} label="Firebase Console" sublabel="service account JSON" />
          <Arrow x1={162} y1={50} x2={248} y2={50} label="base64 encode" />
          <FlowNode x={340} y={50} label="Twilio Comms API" sublabel="POST /Credentials" width={160} />
          <Arrow x1={422} y1={50} x2={528} y2={50} />
          <FlowNode x={600} y={50} label='"fcm_web_test"' sublabel="stored credential" width={130} accent />
        </svg>
      </Box>
    </Box>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>(Notification.permission);
  const [sendTitle, setSendTitle] = useState('Test Notification');
  const [sendBody, setSendBody] = useState('Sent via Twilio Push Notifications API');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
      if (permission !== 'granted') setError('Notification permission denied');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        setSendResult({ ok: true, msg: 'Notification sent successfully!' });
      } else {
        setSendResult({ ok: false, msg: `Failed: ${data.errors?.[0]?.message || JSON.stringify(data)}` });
      }
    } catch (err: any) {
      setSendResult({ ok: false, msg: `Error: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  return (
    <Theme.Provider theme="default">
      <Box backgroundColor="colorBackgroundBody" minHeight="100vh" paddingY="space100" paddingX="space70">
        <Box maxWidth="size70" marginX="auto">
          <Stack orientation="vertical" spacing="space80">

            {/* Header */}
            <Box borderBottomStyle="solid" borderBottomWidth="borderWidth10" borderBottomColor="colorBorderWeak" paddingBottom="space60">
              <Heading as="h1" variant="heading10">Push Notifications Test</Heading>
              <Text as="p" color="colorTextWeak">
                End-to-end FCM web push testing via the Twilio Comms API
              </Text>
            </Box>

            {/* Step 1 — Connect */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Box display="flex" alignItems="center" columnGap="space30">
                  <Box
                    backgroundColor="colorBackgroundPrimaryStrongest"
                    borderRadius="borderRadiusCircle"
                    width="sizeIcon30" height="sizeIcon30"
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    <Text as="span" color="colorTextInverse" fontWeight="fontWeightBold" fontSize="fontSize20">1</Text>
                  </Box>
                  <Heading as="h2" variant="heading30">Connect this browser</Heading>
                </Box>

                {permissionState !== 'granted' ? (
                  <>
                    <Badge as="span" variant="warning">Not Connected</Badge>
                    <Paragraph>Grant notification permission to register this browser with FCM and get a device token.</Paragraph>
                    <Box>
                      <Button variant="primary" onClick={requestPermission}>Enable Notifications</Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Badge as="span" variant="success">Connected</Badge>
                    {token && (
                      <Box>
                        <Label htmlFor="device-token">Device Token</Label>
                        <Box display="flex" columnGap="space30" marginTop="space20">
                          <Input id="device-token" type="text" value={token} readOnly />
                          <Button variant="secondary" onClick={copyToken}>
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </Box>
                        <Text as="p" color="colorTextWeak" fontSize="fontSize20" marginTop="space20">
                          Use this token to target this specific browser when sending via the API directly.
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

            {/* Step 2 — Send */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Box display="flex" alignItems="center" columnGap="space30">
                  <Box
                    backgroundColor="colorBackgroundPrimaryStrongest"
                    borderRadius="borderRadiusCircle"
                    width="sizeIcon30" height="sizeIcon30"
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    <Text as="span" color="colorTextInverse" fontWeight="fontWeightBold" fontSize="fontSize20">2</Text>
                  </Box>
                  <Heading as="h2" variant="heading30">Send a test notification</Heading>
                </Box>

                <Paragraph>
                  Sends a push notification to this browser via a Vercel serverless function that calls the Twilio Push Notifications API.
                </Paragraph>

                <Box display="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Box>
                    <Label htmlFor="send-title">Title</Label>
                    <Input id="send-title" type="text" value={sendTitle} onChange={(e) => setSendTitle(e.target.value)} />
                  </Box>
                  <Box>
                    <Label htmlFor="send-body">Body</Label>
                    <Input id="send-body" type="text" value={sendBody} onChange={(e) => setSendBody(e.target.value)} />
                  </Box>
                </Box>

                <Box>
                  <Button variant="primary" onClick={sendTestPush} disabled={!token || sending} loading={sending}>
                    Send Notification
                  </Button>
                </Box>

                {sendResult && (
                  <Callout variant={sendResult.ok ? 'success' : 'error'}>
                    <CalloutText>{sendResult.msg}</CalloutText>
                  </Callout>
                )}
              </Stack>
            </Card>

            {/* Step 3 — History */}
            <Card>
              <Stack orientation="vertical" spacing="space50">
                <Box display="flex" alignItems="center" columnGap="space30">
                  <Box
                    backgroundColor="colorBackgroundPrimaryStrongest"
                    borderRadius="borderRadiusCircle"
                    width="sizeIcon30" height="sizeIcon30"
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    <Text as="span" color="colorTextInverse" fontWeight="fontWeightBold" fontSize="fontSize20">3</Text>
                  </Box>
                  <Heading as="h2" variant="heading30">Message history</Heading>
                  {messages.length > 0 && <Badge as="span" variant="info">{messages.length}</Badge>}
                </Box>

                {messages.length === 0 ? (
                  <Box
                    backgroundColor="colorBackgroundWeak"
                    borderRadius="borderRadius20"
                    padding="space60"
                    textAlign="center"
                  >
                    <Text as="p" color="colorTextWeak">
                      No foreground messages yet. Send a notification while this tab is focused.
                    </Text>
                  </Box>
                ) : (
                  <Stack orientation="vertical" spacing="space30">
                    {messages.map((msg, i) => (
                      <Box
                        key={i}
                        backgroundColor="colorBackgroundSuccessWeakest"
                        borderLeftStyle="solid"
                        borderLeftWidth="borderWidth20"
                        borderLeftColor="colorBorderSuccess"
                        paddingX="space40"
                        paddingY="space30"
                        borderRadius="borderRadius20"
                      >
                        <Text as="p" fontWeight="fontWeightSemibold" marginBottom="space10">
                          {msg.notification?.title || msg.data?.title || 'Untitled'}
                        </Text>
                        <Text as="p" color="colorTextWeak" fontSize="fontSize20">
                          {msg.notification?.body || msg.data?.body || JSON.stringify(msg.data)}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* How It Works */}
            <Card>
              <Stack orientation="vertical" spacing="space60">
                <Heading as="h2" variant="heading30">How it works</Heading>
                <FlowDiagram />
                <Box borderTopStyle="solid" borderTopWidth="borderWidth10" borderTopColor="colorBorderWeak" paddingTop="space50">
                  <Heading as="h3" variant="heading50">Send from your own Twilio account</Heading>
                  <Paragraph>
                    See the{' '}
                    <Anchor href="https://github.com/macarey/fcm-web-push-demo" showExternal>README</Anchor>
                    {' '}for instructions on uploading the Firebase service account key to your own Twilio account as an FCM credential.
                  </Paragraph>
                </Box>
              </Stack>
            </Card>

          </Stack>
        </Box>
      </Box>
    </Theme.Provider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
