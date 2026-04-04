import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Film } from 'lucide-react-native';
import type { MediaResult } from '@/types';
import { tmdbImage } from '@/utils';
import { colors } from '@/theme';
import { StatusBadge } from './StatusBadge';

const DEFAULT_CARD_WIDTH = 130;

export interface MediaCardProps {
  item: MediaResult;
  width?: number;
}

export function MediaCard({ item, width = DEFAULT_CARD_WIDTH }: MediaCardProps) {
  const cardHeight = Math.round(width * 1.5); // 2:3 ratio
  const title = item.title ?? item.name ?? '';
  const year = (item.releaseDate ?? item.firstAirDate ?? '').slice(0, 4);
  const posterUri = tmdbImage.poster(item.posterPath, 'w342');
  const mediaType = item.mediaType === 'tv' ? 'tv' : 'movie';

  function handlePress() {
    router.push(`/media/${item.id}?type=${mediaType}`);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, width })}
    >
      {/* Poster */}
      <View
        className="rounded-md overflow-hidden bg-background-elevated"
        style={{ width, height: cardHeight }}
      >
        {posterUri ? (
          <Image
            source={{ uri: posterUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Film size={32} color={colors.content.muted} />
          </View>
        )}

        {/* Status badge overlay */}
        {item.mediaInfo && (
          <View className="absolute top-xs right-xs">
            <StatusBadge status={item.mediaInfo.status} />
          </View>
        )}
      </View>

      {/* Text */}
      <Text
        className="text-body-sm text-content-primary mt-xs font-medium"
        numberOfLines={2}
        style={{ width }}
      >
        {title}
      </Text>
      {year ? (
        <Text className="text-caption text-content-muted mt-xs">{year}</Text>
      ) : null}
    </Pressable>
  );
}
