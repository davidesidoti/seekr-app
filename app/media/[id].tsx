import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Plus, Play, Check, X } from 'lucide-react-native';
import { MediaHero, StatusBadge, CastList, MediaRow, RequestModal } from '@/components/media';
import { useMediaDetails, useRecommendations, useManageRequest } from '@/hooks';
import { useAuthStore } from '@/stores';
import { colors } from '@/theme';
import { MediaStatus, RequestStatus } from '@/types';
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
  const { serverUrl, user } = useAuthStore();
  const { approve, decline } = useManageRequest();
  const canManage = !!user && (user.permissions & (2 | 8)) !== 0;

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
  const pendingRequests =
    canManage
      ? (mediaInfo?.requests ?? []).filter((r) => r.status === RequestStatus.PENDING_APPROVAL)
      : [];

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
            <View className="flex-row gap-sm">
              {(mediaInfo?.status === MediaStatus.AVAILABLE ||
                mediaInfo?.status === MediaStatus.PARTIALLY_AVAILABLE) && (
                <Pressable
                  onPress={() => Linking.openURL(`${serverUrl}/web`)}
                  className="flex-row items-center bg-background-elevated rounded-xl px-lg py-sm gap-xs"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Play size={15} color={colors.content.primary} />
                  <Text className="text-body-sm text-content-primary font-semibold">Watch</Text>
                </Pressable>
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
          </View>

          {/* Pending requests — admin only */}
          {pendingRequests.length > 0 && (
            <View className="mb-lg">
              <Text className="text-caption text-content-muted font-medium uppercase mb-sm" style={{ letterSpacing: 0.6 }}>
                Pending Requests
              </Text>
              {pendingRequests.map((req) => (
                <View
                  key={req.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.border.DEFAULT + '40',
                  }}
                >
                  <Text className="text-body-sm text-content-secondary flex-1" numberOfLines={1}>
                    {req.requestedBy.displayName ?? req.requestedBy.username ?? req.requestedBy.email ?? `User #${req.requestedBy.id}`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => approve.mutate(req.id)}
                      disabled={approve.isPending || decline.isPending}
                      style={({ pressed }) => ({ opacity: pressed || approve.isPending ? 0.6 : 1 })}
                    >
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                        backgroundColor: colors.status.available + '20',
                      }}>
                        <Check size={13} color={colors.status.available} />
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.status.available }}>Approve</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => decline.mutate(req.id)}
                      disabled={approve.isPending || decline.isPending}
                      style={({ pressed }) => ({ opacity: pressed || decline.isPending ? 0.6 : 1 })}
                    >
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                        backgroundColor: colors.status.declined + '20',
                      }}>
                        <X size={13} color={colors.status.declined} />
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.status.declined }}>Decline</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

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
