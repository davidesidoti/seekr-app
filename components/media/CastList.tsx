import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import type { CastMember } from '@/types';
import { tmdbImage } from '@/utils';
import { colors, spacing } from '@/theme';

const AVATAR_SIZE = 64;
const ITEM_WIDTH = 80;

export interface CastListProps {
  cast: CastMember[];
}

export function CastList({ cast }: CastListProps) {
  if (!cast.length) return null;

  return (
    <View className="mb-2xl">
      <Text className="text-h2 text-content-primary font-semibold px-lg mb-md">Cast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          gap: spacing.md,
        }}
      >
        {cast.slice(0, 20).map((member) => {
          const avatarUri = tmdbImage.avatar(member.profilePath);
          return (
            <View key={member.id} style={{ width: ITEM_WIDTH, alignItems: 'center' }}>
              <View
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  overflow: 'hidden',
                  backgroundColor: colors.background.elevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <User size={28} color={colors.content.muted} />
                )}
              </View>
              <Text
                className="text-caption text-content-primary mt-xs text-center font-medium"
                numberOfLines={2}
                style={{ width: ITEM_WIDTH }}
              >
                {member.name}
              </Text>
              <Text
                className="text-caption text-content-muted text-center"
                numberOfLines={1}
                style={{ width: ITEM_WIDTH }}
              >
                {member.character}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
