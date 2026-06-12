export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, body } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing device token' });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !authToken) {
    return res.status(500).json({ error: 'Twilio credentials not configured' });
  }

  const credentials = Buffer.from(`${sid}:${authToken}`).toString('base64');

  const response = await fetch('https://comms.twilio.com/preview/PushNotifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify({
      from: { appName: 'fcm_web_test' },
      to: [{ token, provider: 'FCM' }],
      content: {
        title: title || 'Test Notification',
        body: body || 'Sent via Twilio Push Notifications API',
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  return res.status(200).json(data);
}
