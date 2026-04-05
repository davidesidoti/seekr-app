import { useState, useRef } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  type TextInput as TextInputType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Lock } from 'lucide-react-native';
import axios from 'axios';

import { Button, Input } from '@/components/ui';
import { authService, registerPushToken } from '@/services';
import { useAuthStore } from '@/stores';
import { useSettingsStore } from '@/stores/settingsStore';

function friendlyError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Server unreachable. Check your connection.';
    if (err.response.status === 401 || err.response.status === 403)
      return 'Invalid username or password.';
    return `Server error (${err.response.status}). Try again.`;
  }
  return 'Something went wrong. Try again.';
}

export default function LoginScreen() {
  const serverUrl = useAuthStore((s) => s.serverUrl);
  const login = useAuthStore((s) => s.login);
  const setServer = useAuthStore((s) => s.setServer);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<TextInputType>(null);

  const displayUrl = serverUrl?.replace(/^https?:\/\//, '') ?? '';

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authService.loginWithJellyfin({ username: username.trim(), password });
      login(user);
      // Fire-and-forget: register push token if relay is configured and notifications enabled
      const { notificationsEnabled, pushRelayUrl } = useSettingsStore.getState();
      if (notificationsEnabled && pushRelayUrl) registerPushToken();
      router.replace('/(tabs)');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleChangeServer() {
    setServer('');
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 px-lg"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-1 justify-center pt-5xl pb-3xl">
            <Text className="text-h1 text-content-primary font-bold">Sign in</Text>
            {displayUrl ? (
              <Text className="text-body-sm text-content-secondary mt-xs" numberOfLines={1}>
                {displayUrl}
              </Text>
            ) : null}
          </View>

          {/* Form */}
          <View className="pb-2xl gap-md">
            <Input
              icon={User}
              label="Username"
              placeholder="jellyfin_username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              icon={Lock}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {error ? (
              <Text className="text-body-sm text-status-declined text-center">{error}</Text>
            ) : null}

            <Button onPress={handleLogin} loading={loading} fullWidth>
              Sign in
            </Button>

            <Button onPress={handleChangeServer} variant="ghost" fullWidth>
              Change server
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
