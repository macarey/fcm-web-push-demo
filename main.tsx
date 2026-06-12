import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@twilio-paste/core/theme';
import { Box } from '@twilio-paste/core/box';
import { Heading } from '@twilio-paste/core/heading';
import { Text } from '@twilio-paste/core/text';
import { Button } from '@twilio-paste/core/button';
import { Card } from '@twilio-paste/core/card';
import { Stack } from '@twilio-paste/core/stack';
import { Separator } from '@twilio-paste/core/separator';
import { Badge } from '@twilio-paste/core/badge';
import { Callout, CalloutHeading, CalloutText } from '@twilio-paste/core/callout';
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

  return (
    <Theme.Provider theme="default">
      <Box backgroundColor="colorBackgroundBody" minHeight="100vh" padding="space100">
        <Box maxWidth="640px" marginX="auto">
          <Stack orientation="vertical" spacing="space60">
            <Box>
              <Heading as="h1" variant="heading10">
                Push Notifications Test
              </Heading>
              <Text as="p" color="colorTextWeak">
                FCM web push via Twilio Comms API
              </Text>
            </Box>

            <Card>
              <Stack orientation="vertical" spacing="space50">
                {permissionState !== 'granted' ? (
                  <>
                    <Box display="flex" alignItems="center" columnGap="space30">
                      <Badge as="span" variant="warning">Permission Required</Badge>
                    </Box>
                    <Text as="p" color="colorTextWeak">
                      Allow notifications to receive push messages from Twilio.
                    </Text>
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
                        <Text as="p" fontWeight="fontWeightSemibold" marginBottom="space20">
                          Device Token
                        </Text>
                        <Box
                          backgroundColor="colorBackgroundWeak"
                          padding="space30"
                          borderRadius="borderRadius20"
                          fontFamily="fontFamilyCode"
                          fontSize="fontSize20"
                          overflowX="auto"
                          style={{ wordBreak: 'break-all' }}
                        >
                          {token}
                        </Box>
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

            <Separator orientation="horizontal" />

            <Box>
              <Heading as="h2" variant="heading20">
                Messages
              </Heading>
              {messages.length === 0 ? (
                <Text as="p" color="colorTextWeak">
                  No messages received yet. Send a push notification to see it here.
                </Text>
              ) : (
                <Stack orientation="vertical" spacing="space40">
                  {messages.map((msg, i) => (
                    <Card key={i}>
                      <Stack orientation="vertical" spacing="space20">
                        <Text as="p" fontWeight="fontWeightSemibold">
                          {msg.notification?.title || msg.data?.title || 'Untitled'}
                        </Text>
                        <Text as="p" color="colorTextWeak">
                          {msg.notification?.body || msg.data?.body || JSON.stringify(msg.data)}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Theme.Provider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
