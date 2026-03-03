import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const app = getFirebaseAdmin();
  const messaging = admin.messaging(app);

  try {
    await messaging.send({
      token,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          requireInteraction: true,
        },
      },
    });
    return true;
  } catch (error) {
    console.error("FCM send error:", error);
    return false;
  }
}

export async function sendAlertNotification(
  token: string,
  symbolName: string,
  currentPrice: number,
  targetPrice: number,
  direction: string
) {
  const directionText = direction === "above" ? "이상" : "이하";
  return sendPushNotification(
    token,
    `${symbolName} 목표가 도달!`,
    `현재가 ${currentPrice.toLocaleString()}원 (목표: ${targetPrice.toLocaleString()}원 ${directionText})`,
    { symbol: symbolName, price: String(currentPrice) }
  );
}
