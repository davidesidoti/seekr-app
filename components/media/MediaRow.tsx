import { View, Text, ScrollView } from 'react-native';
import { spacing } from '@/theme';
import type { MediaResult } from '@/types';
import { MediaCard } from './MediaCard';
import { MediaCardSkeleton } from './MediaCardSkeleton';

const GAP = spacing.md; // 12px
const SIDE_PADDING = spacing.lg; // 16px
const SKELETON_COUNT = 5;

export interface MediaRowProps {
  title: string;
  data: MediaResult[] | undefined;
  isLoading?: boolean;
}

export function MediaRow({ title, data, isLoading }: MediaRowProps) {
  return (
    <View className="mb-2xl">
      <Text className="text-h2 text-content-primary font-semibold px-lg mb-md">{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING,
          gap: GAP,
        }}
      >
        {isLoading || !data
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))
          : data.map((item) => <MediaCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  );
}
