import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Requests notification permissions, obtains the Expo push token, and
 * registers it with the push relay VPS so Jellyseerr webhooks can reach
 * this device. Safe to call fire-and-forget — errors are swallowed.
 */
export async function registerPushToken(): Promise<void> {
  try {
    // Push tokens only work on physical devices
    if (!Device.isDevice) return;

    const { pushRelayUrl } = useSettingsStore.getState();
    if (!pushRelayUrl) return;

    const email = useAuthStore.getState().user?.email;
    if (!email) return;

    // Request permission if not already granted
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) return;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    await axios.post(
      `${pushRelayUrl.replace(/\/$/, '')}/register`,
      { email, pushToken: token },
      { timeout: 8000 },
    );
  } catch {
    // Never crash the app over push registration
  }
}
