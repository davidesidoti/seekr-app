import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Globe } from 'lucide-react-native';
import axios from 'axios';

import { Button, Input } from '@/components/ui';
import { authService } from '@/services';
import { useAuthStore } from '@/stores';

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '');
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function friendlyError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Server unreachable. Check the URL and your network.';
    if (err.response.status === 404) return 'Not a Jellyseerr instance. Check the URL.';
    return `Server returned ${err.response.status}. Check the URL.`;
  }
  return 'Something went wrong. Try again.';
}

export default function ServerSetupScreen() {
  const setServer = useAuthStore((s) => s.setServer);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect() {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError('Please enter your Jellyseerr server URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const settings = await authService.getPublicSettings(normalized);
      if (!settings.initialized) {
        setError('This Jellyseerr server is not fully set up yet.');
        return;
      }
      setServer(normalized);
      router.push('/(auth)/login');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
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
          {/* Branding */}
          <View className="flex-1 justify-center items-center pt-5xl pb-3xl">
            <Text className="text-display text-content-primary font-bold tracking-tight">
              Seekr
            </Text>
            <Text className="text-body text-content-secondary mt-sm text-center">
              Your Jellyseerr companion for iOS
            </Text>
          </View>

          {/* Form */}
          <View className="pb-2xl gap-md">
            <Text className="text-h2 text-content-primary font-semibold">
              Connect to your server
            </Text>
            <Text className="text-body-sm text-content-secondary -mt-xs">
              Enter the URL of your Jellyseerr instance.
            </Text>

            <Input
              icon={Globe}
              placeholder="https://requests.example.com"
              value={url}
              onChangeText={(t) => {
                setUrl(t);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleConnect}
              error={error}
            />

            <Button onPress={handleConnect} loading={loading} fullWidth>
              Connect
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
