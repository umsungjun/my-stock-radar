/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey,
  authDomain: self.__FIREBASE_CONFIG__?.authDomain,
  projectId: self.__FIREBASE_CONFIG__?.projectId,
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId,
  appId: self.__FIREBASE_CONFIG__?.appId,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "MyStockRadar", {
    body: body || "가격 알림이 도착했습니다",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
  });
});
