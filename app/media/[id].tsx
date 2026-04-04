import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { MediaHero, StatusBadge, CastList, MediaRow, RequestModal } from '@/components/media';
import { useMediaDetails, useRecommendations } from '@/hooks';
import { colors } from '@/theme';
import { MediaStatus } from '@/types';
import type { MovieDetails, TvDetails } from '@/types';

function isMovie(detail: MovieDetails | TvDetails): detail is MovieDetails {
  return 'title' in detail;
}

export default function MediaDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const mediaType = (type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
  const numericId = Number(id);

  const { data, isLoading, isError } = useMediaDetails(numericId, mediaType);
  const recommendations = useRecommendations(numericId, mediaType);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
      </View>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center px-lg">
        <Text className="text-h3 text-content-primary text-center mb-md">
          Failed to load media details
        </Text>
        <Pressable onPress={handleBack}>
          <Text className="text-body text-accent">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const title = isMovie(data) ? data.title : data.name;
  const year = isMovie(data)
    ? data.releaseDate?.slice(0, 4) ?? ''
    : (data as TvDetails).firstAirDate?.slice(0, 4) ?? '';
  const overview = data.overview;
  const cast = data.credits.cast;
  const genres = data.genres;
  const mediaInfo = data.mediaInfo;

  return (
    <View className="flex-1 bg-background-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <MediaHero
          backdropPath={data.backdropPath}
          posterPath={data.posterPath}
          title={title}
          year={year}
          voteAverage={data.voteAverage}
          genres={genres}
        />

        <View className="px-lg">
          {/* Status + Request */}
          <View className="flex-row items-center justify-between mb-lg">
            {mediaInfo ? (
              <StatusBadge status={mediaInfo.status} />
            ) : (
              <View />
            )}
            {(!mediaInfo ||
              mediaInfo.status === MediaStatus.UNKNOWN ||
              mediaInfo.status === MediaStatus.DELETED) && (
              <Pressable
                onPress={() => setRequestModalVisible(true)}
                className="flex-row items-center bg-accent rounded-xl px-lg py-sm gap-xs"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Plus size={16} color="#fff" />
                <Text className="text-body-sm text-white font-semibold">Request</Text>
              </Pressable>
            )}
          </View>

          {/* Overview */}
          {overview ? (
            <View className="mb-2xl">
              <Text className="text-h3 text-content-primary font-semibold mb-sm">Overview</Text>
              <Text className="text-body text-content-secondary leading-6">{overview}</Text>
            </View>
          ) : null}

          {/* Info row */}
          <View className="flex-row flex-wrap gap-md mb-2xl">
            {isMovie(data) && data.runtime > 0 ? (
              <View className="bg-background-card rounded-lg px-md py-sm">
                <Text className="text-caption text-content-muted mb-xs">Runtime</Text>
                <Text className="text-body-sm text-content-primary font-medium">
                  {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                </Text>
              </View>
            ) : null}
            {!isMovie(data) && (data as TvDetails).numberOfSeasons > 0 ? (
              <View className="bg-background-card rounded-lg px-md py-sm">
                <Text className="text-caption text-content-muted mb-xs">Seasons</Text>
                <Text className="text-body-sm text-content-primary font-medium">
                  {(data as TvDetails).numberOfSeasons}
                </Text>
              </View>
            ) : null}
            {genres.slice(0, 2).map((g) => (
              <View key={g.id} className="bg-background-card rounded-lg px-md py-sm">
                <Text className="text-body-sm text-content-primary font-medium">{g.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cast */}
        <CastList cast={cast} />

        {/* Recommendations */}
        {(recommendations.data?.results?.length ?? 0) > 0 && (
          <MediaRow
            title="More Like This"
            data={recommendations.data?.results}
            isLoading={recommendations.isLoading}
          />
        )}

        <View className="h-2xl" />
      </ScrollView>

      {/* Back button */}
      <SafeAreaView
        edges={['top']}
        className="absolute top-0 left-0 right-0"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleBack}
          className="ml-md mt-xs w-10 h-10 rounded-full bg-background-elevated items-center justify-center"
          style={{ backgroundColor: 'rgba(36,36,64,0.85)' }}
        >
          <ChevronLeft size={22} color={colors.content.primary} />
        </Pressable>
      </SafeAreaView>

      <RequestModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        mediaId={numericId}
        mediaType={mediaType}
        title={title}
        seasons={isMovie(data) ? undefined : (data as TvDetails).seasons}
        mediaInfo={mediaInfo}
      />
    </View>
  );
}
