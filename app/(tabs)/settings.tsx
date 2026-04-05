import { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LogOut, Server } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { useSettingsStore } from '@/stores/settingsStore';
import { authService, registerPushToken } from '@/services';
import { queryClient } from '@/hooks';
import { colors } from '@/theme';

const USER_TYPE_LABELS: Record<number, string> = {
  1: 'Plex account',
  2: 'Jellyfin account',
  3: 'Local account',
  4: 'Emby account',
};

export default function SettingsScreen() {
  const { user: storedUser, serverUrl, logout } = useAuthStore();

  // Fetch fresh profile to get email + correct display name
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.validateSession(),
    staleTime: 5 * 60 * 1000,
  });

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const { notificationsEnabled, pushRelayUrl, update: updateSettings } = useSettingsStore();
  const [relayUrlDraft, setRelayUrlDraft] = useState(pushRelayUrl);

  async function handleNotificationsToggle(value: boolean) {
    updateSettings({ notificationsEnabled: value });
    if (value) {
      // Trigger registration immediately when the user turns notifications on
      if (!pushRelayUrl) {
        Alert.alert('Relay URL required', 'Enter the push relay URL first.');
        updateSettings({ notificationsEnabled: false });
        return;
      }
      await registerPushToken();
    }
  }

  function commitRelayUrl() {
    const trimmed = relayUrlDraft.trim().replace(/\/$/, '');
    updateSettings({ pushRelayUrl: trimmed });
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } catch {
            // ignore — clear local state regardless
          }
          queryClient.clear();
          logout();
          router.replace('/(auth)');
        },
      },
    ]);
  }

  if (!storedUser) return null;

  const displayName =
    currentUser?.username || currentUser?.email || storedUser.username || '—';
  const rawAvatar = currentUser?.avatar ?? storedUser.avatar;
  // Jellyseerr may return a relative path (/avatarproxy/...) — resolve against serverUrl
  const resolvedAvatar = rawAvatar
    ? rawAvatar.startsWith('http')
      ? rawAvatar
      : rawAvatar.startsWith('/')
      ? `${serverUrl}${rawAvatar}`
      : null
    : null;
  const userType = currentUser?.userType ?? storedUser.userType;
  const initials = (displayName !== '—' ? displayName : 'U').slice(0, 2).toUpperCase();
  const accountType = USER_TYPE_LABELS[userType] ?? 'Unknown account';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.content.primary }}>
            Settings
          </Text>
        </View>

        {/* Account */}
        <SectionLabel label="Account" />
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.accent.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginRight: 14,
              }}
            >
              {resolvedAvatar ? (
                <Image
                  source={{ uri: resolvedAvatar }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                  {initials}
                </Text>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: colors.content.primary }}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {currentUser?.email && currentUser.email !== displayName && (
                <Text
                  style={{ fontSize: 13, color: colors.content.muted, marginTop: 1 }}
                  numberOfLines={1}
                >
                  {currentUser.email}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: colors.content.muted, marginTop: 2 }}>
                {accountType}
              </Text>
            </View>
          </View>
        </View>

        {/* Server */}
        <SectionLabel label="Server" />
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{ backgroundColor: colors.background.card, borderRadius: 14, padding: 16 }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
            >
              <Server size={14} color={colors.content.muted} />
              <Text style={{ fontSize: 13, color: colors.content.muted, marginLeft: 6, flex: 1 }}>
                Connected to
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: '#10b981',
                    marginRight: 5,
                  }}
                />
                <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '500' }}>
                  Online
                </Text>
              </View>
            </View>
            <Text
              style={{ fontSize: 14, color: colors.content.primary, fontWeight: '500' }}
              numberOfLines={1}
            >
              {serverUrl}
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 14,
              paddingHorizontal: 16,
            }}
          >
            {/* Relay URL input */}
            <View
              style={{
                paddingVertical: 14,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border.DEFAULT + '60',
              }}
            >
              <Text style={{ fontSize: 13, color: colors.content.muted, marginBottom: 6 }}>
                Push relay URL
              </Text>
              <TextInput
                value={relayUrlDraft}
                onChangeText={setRelayUrlDraft}
                onBlur={commitRelayUrl}
                onSubmitEditing={commitRelayUrl}
                placeholder="https://push.yourdomain.com"
                placeholderTextColor={colors.content.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                style={{
                  fontSize: 14,
                  color: colors.content.primary,
                  padding: 0,
                }}
              />
            </View>

            {/* Enable toggle */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.content.primary }}>
                Enable notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.background.elevated, true: colors.accent.DEFAULT }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* App */}
        <SectionLabel label="App" />
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 14,
              paddingHorizontal: 16,
            }}
          >
            <Row label="Version" value={appVersion} divider />
            <Row label="Powered by" value="@Hash" />
          </View>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View
              style={{
                backgroundColor: colors.background.card,
                borderRadius: 14,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <LogOut size={18} color={colors.status.declined} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: colors.status.declined,
                  marginLeft: 10,
                }}
              >
                Sign Out
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '600',
        color: colors.content.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        paddingHorizontal: 16,
      }}
    >
      {label}
    </Text>
  );
}

function Row({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: divider ? 0.5 : 0,
        borderBottomColor: colors.border.DEFAULT + '60',
      }}
    >
      <Text style={{ fontSize: 15, color: colors.content.primary }}>{label}</Text>
      <Text style={{ fontSize: 15, color: colors.content.muted }}>{value}</Text>
    </View>
  );
}
