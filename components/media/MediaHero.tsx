import { View, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import type { Genre } from '@/types';
import { tmdbImage } from '@/utils';
import { colors } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_HEIGHT = Math.round(SCREEN_WIDTH * 0.56); // 16:9 ish
const POSTER_WIDTH = 90;
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.5);
const POSTER_OVERLAP = 32; // how much poster overlaps below backdrop

export interface MediaHeroProps {
  backdropPath: string | null;
  posterPath: string | null;
  title: string;
  year: string;
  voteAverage: number;
  genres: Genre[];
}

export function MediaHero({
  backdropPath,
  posterPath,
  title,
  year,
  voteAverage,
  genres,
}: MediaHeroProps) {
  const backdropUri = tmdbImage.backdrop(backdropPath, 'w1280');
  const posterUri = tmdbImage.poster(posterPath, 'w500');
  const rating = voteAverage > 0 ? voteAverage.toFixed(1) : null;

  return (
    <View style={{ marginBottom: POSTER_OVERLAP }}>
      {/* Backdrop */}
      <View style={{ width: SCREEN_WIDTH, height: BACKDROP_HEIGHT, backgroundColor: colors.background.elevated }}>
        {backdropUri ? (
          <Image
            source={{ uri: backdropUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: BACKDROP_HEIGHT * 0.6 }}
        />
      </View>

      {/* Poster + meta row (overlaps backdrop) */}
      <View
        className="flex-row px-lg"
        style={{ marginTop: -POSTER_OVERLAP }}
      >
        {/* Poster */}
        <View
          style={{
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: colors.background.elevated,
          }}
        >
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : null}
        </View>

        {/* Title + meta */}
        <View className="flex-1 pl-md justify-end pb-xs">
          <Text className="text-h2 text-content-primary font-bold" numberOfLines={3}>
            {title}
          </Text>
          <View className="flex-row items-center gap-sm mt-xs flex-wrap">
            {year ? (
              <Text className="text-body-sm text-content-secondary">{year}</Text>
            ) : null}
            {rating ? (
              <View className="flex-row items-center gap-xs">
                <Star size={12} color={colors.status.partial} fill={colors.status.partial} />
                <Text className="text-body-sm text-content-secondary">{rating}</Text>
              </View>
            ) : null}
          </View>

          {/* Genre tags */}
          {genres.length > 0 ? (
            <View className="flex-row flex-wrap gap-xs mt-xs">
              {genres.slice(0, 3).map((g) => (
                <View key={g.id} className="bg-background-elevated rounded-full px-sm py-xs">
                  <Text className="text-caption text-content-secondary">{g.name}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
