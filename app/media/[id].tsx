import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-lg pt-2xl">
        <Text className="text-h1 text-content-primary font-bold">Media Detail</Text>
        <Text className="text-body text-content-secondary mt-sm">ID: {id}</Text>
      </View>
    </SafeAreaView>
  );
}
