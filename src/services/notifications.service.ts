import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

// ─── Configuration ──────────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

// ─── Service ────────────────────────────────────────────────────────────────

export const notificationsService = {
  /**
   * Requests permission and registers Expo push token with the backend.
   * Safe to call multiple times — skips if already granted.
   */
  async registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null; // Emulator / simulator — skip

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Register token in backend (best-effort — silent on failure)
    try {
      await api.post('/users/push-token', {
        token,
        platform: Platform.OS as 'ios' | 'android',
      });
    } catch {
      // Backend endpoint may not be deployed yet — fail silently
    }

    return token;
  },

  /**
   * Schedules local notifications for trial expiry:
   * - 24h before expiry
   * - 6h before expiry
   */
  async scheduleTrialExpiryNotifications(expiresAt: string): Promise<void> {
    const expireDate = new Date(expiresAt);
    const now = Date.now();

    // Cancel previous trial notifications before re-scheduling
    await notificationsService.cancelTrialNotifications();

    const triggers: Array<{ offsetMs: number; title: string; body: string }> = [
      {
        offsetMs: -24 * 60 * 60 * 1000, // 24h before
        title: '⏰ Seu trial expira em 24 horas',
        body: 'Assine um plano para continuar com acesso completo aos canais HD/4K.',
      },
      {
        offsetMs: -6 * 60 * 60 * 1000, // 6h before
        title: '⚠️ Trial expira em 6 horas!',
        body: 'Não perca seu acesso — escolha um plano agora.',
      },
    ];

    for (const trigger of triggers) {
      const triggerDate = new Date(expireDate.getTime() + trigger.offsetMs);
      if (triggerDate.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `trial-expiry-${trigger.offsetMs}`,
          content: {
            title: trigger.title,
            body: trigger.body,
            data: { type: 'trial_expiry' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
        });
      }
    }
  },

  /**
   * Cancels all previously scheduled trial expiry notifications.
   */
  async cancelTrialNotifications(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync('trial-expiry--86400000');
    await Notifications.cancelScheduledNotificationAsync('trial-expiry--21600000');
  },

  /**
   * Sends a local notification immediately (e.g. payment confirmed).
   */
  async sendLocalNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // Fire immediately
    });
  },
};
