import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Service Worker에 Firebase config 전달
    const sw = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    // Config를 SW에 전달
    sw.active?.postMessage({
      type: "FIREBASE_CONFIG",
      config: firebaseConfig,
    });

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: sw,
    });

    return token;
  } catch (error) {
    console.error("FCM token error:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
