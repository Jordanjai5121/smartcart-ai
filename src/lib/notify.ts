import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const KEY = 'smartcart_notified';

function seen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export async function notifyOnce(key: string, title: string, body: string) {
  if (!Capacitor.isNativePlatform()) return;
  const done = seen();
  if (done.includes(key)) return;

  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Math.random() * 2147480000) + 1,
        title,
        body,
      }],
    });

    localStorage.setItem(KEY, JSON.stringify([...done, key].slice(-200)));
  } catch (e) {
    console.error('Notification failed', e);
  }
}