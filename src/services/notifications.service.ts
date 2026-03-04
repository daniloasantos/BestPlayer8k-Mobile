import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

// ─── Expo Go detection ───────────────────────────────────────────────────────
// expo-notifications removed remote push support from Expo Go in SDK 53.
// Importing the module at all causes a console.error via the auto-registration
// side-effect (hTokenAutoRegistration.fx.js). We lazy-require it only when
// running in a proper dev/prod build.

const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

type NotificationsModule = typeof import('expo-notifications');

function getNotifications(): NotificationsModule | null {
  if (IS_EXPO_GO) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-notifications') as NotificationsModule;
}

// Set up notification handler once, outside Expo Go
const Notifications = getNotifications();
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

// ─── Service ────────────────────────────────────────────────────────────────

export const notificationsService = {
  /**
   * Requests permission and registers Expo push token with the backend.
   * No-op in Expo Go (SDK 53+ removed remote push support there).
   */
  async registerPushToken(): Promise<string | null> {
    if (!Notifications) return null; // Expo Go — skip

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Device = require('expo-device') as typeof import('expo-device');
    if (!Device.isDevice) return null; // Emulator / simulator — skip

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    let token: string;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } catch {
      return null;
    }

    // Register with backend (best-effort — silent on failure)
    try {
      await api.post('/users/push-token', {
        token,
        platform: Platform.OS as 'ios' | 'android',
      });
    } catch {
      // Backend endpoint may not be deployed yet
    }

    return token;
  },

  /**
   * Schedules local notifications for trial expiry:
   * - 24h before expiry
   * - 6h before expiry
   * No-op in Expo Go.
   */
  async scheduleTrialNotifications(expiresAt: string): Promise<void> {
    if (!Notifications) return;

    const expireDate = new Date(expiresAt);
    const now = Date.now();

    await notificationsService.cancelTrialNotifications();

    const triggers: Array<{ offsetMs: number; title: string; body: string }> = [
      {
        offsetMs: -24 * 60 * 60 * 1000,
        title: '⏰ Seu trial expira em 24 horas',
        body: 'Assine um plano para continuar com acesso completo aos canais HD/4K.',
      },
      {
        offsetMs: -6 * 60 * 60 * 1000,
        title: '⚠️ Trial expira em 6 horas!',
        body: 'Não perca seu acesso — escolha um plano agora.',
      },
    ];

    for (const trigger of triggers) {
      const triggerDate = new Date(expireDate.getTime() + trigger.offsetMs);
      if (triggerDate.getTime() > now) {
        try {
          await Notifications.scheduleNotificationAsync({
            identifier: `trial-expiry-${trigger.offsetMs}`,
            content: {
              title: trigger.title,
              body: trigger.body,
              data: { type: 'trial_expiry' },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
          });
        } catch {
          // silent
        }
      }
    }
  },

  /**
   * Cancels all previously scheduled trial expiry notifications.
   */
  async cancelTrialNotifications(): Promise<void> {
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync('trial-expiry--86400000');
      await Notifications.cancelScheduledNotificationAsync('trial-expiry--21600000');
    } catch {
      // silent
    }
  },

  /**
   * Sends a local notification immediately.
   * No-op in Expo Go.
   */
  async sendLocalNotification(title: string, body: string): Promise<void> {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });
    } catch {
      // silent
    }
  },
};
