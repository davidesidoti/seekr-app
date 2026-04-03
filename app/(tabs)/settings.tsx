import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="px-lg pt-2xl">
        <Text className="text-h1 text-content-primary font-bold">Settings</Text>
        <Text className="text-body text-content-secondary mt-sm">
          Account and preferences
        </Text>
      </View>
    </SafeAreaView>
  );
}
