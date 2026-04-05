import { useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Film, Tv, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { useRequests, useManageRequest } from '@/hooks';
import { StatusBadge } from '@/components/media';
import { mediaService } from '@/services';
import { tmdbImage } from '@/utils';
import { colors } from '@/theme';
import { RequestStatus, MediaStatus } from '@/types';
import { useAuthStore } from '@/stores';
import type { MediaRequest, RequestFilter, RequestStatusValue, MediaStatusValue } from '@/types';
import type { MovieDetails, TvDetails } from '@/types';

// Jellyseerr permission bitmask
const PERM_ADMIN = 2;
const PERM_MANAGE_REQUESTS = 8;

const FILTERS: { label: string; value: RequestFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Available', value: 'available' },
  { label: 'Declined', value: 'failed' },
];

function RequestStatusDisplay({
  requestStatus,
  mediaStatus,
}: {
  requestStatus: RequestStatusValue;
  mediaStatus: MediaStatusValue;
}) {
  if (requestStatus === RequestStatus.DECLINED) {
    return (
      <View
        style={{
          borderRadius: 99,
          paddingHorizontal: 8,
          paddingVertical: 3,
          alignSelf: 'flex-start',
          backgroundColor: colors.status.declined + '25',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '500', color: colors.status.declined }}>
          Declined
        </Text>
      </View>
    );
  }
  if (mediaStatus !== MediaStatus.UNKNOWN) {
    return <StatusBadge status={mediaStatus} />;
  }
  return (
    <View
      style={{
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        backgroundColor: colors.status.pending + '25',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: colors.status.pending }}>
        Pending
      </Text>
    </View>
  );
}

export default function RequestsScreen() {
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('all');
  const { data, isLoading, isRefetching, refetch } = useRequests(activeFilter);
  const { approve, decline } = useManageRequest();
  const { user } = useAuthStore();
  const canManage = !!user && (user.permissions & (PERM_ADMIN | PERM_MANAGE_REQUESTS)) !== 0;
  const requests = data?.results ?? [];

  // Fetch media details for titles + posters (served from cache if already visited)
  const mediaDetailQueries = useQueries({
    queries: requests.map((req) => ({
      queryKey: ['media', req.media.mediaType, req.media.tmdbId] as const,
      queryFn: () =>
        req.media.mediaType === 'movie'
          ? mediaService.getMovieDetails(req.media.tmdbId)
          : mediaService.getTvDetails(req.media.tmdbId),
      staleTime: 10 * 60 * 1000,
      enabled: req.media.tmdbId > 0,
    })),
  });

  function renderItem({ item, index }: { item: MediaRequest; index: number }) {
    const isPending = item.status === RequestStatus.PENDING_APPROVAL;
    const showActions = canManage && isPending;
    const details = mediaDetailQueries[index]?.data as MovieDetails | TvDetails | undefined;
    const title = details
      ? 'title' in details
        ? details.title
        : details.name
      : null;
    const posterUri = details?.posterPath ? tmdbImage.poster(details.posterPath, 'w92') : null;
    const isMovie = item.media.mediaType === 'movie';
    const seasonCount = item.seasons?.length ?? 0;
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Pressable
        onPress={() => router.push(`/media/${item.media.tmdbId}?type=${item.media.mediaType}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border.DEFAULT + '50',
          }}
        >
          {/* Poster */}
          <View
            style={{
              width: 52,
              height: 78,
              borderRadius: 6,
              overflow: 'hidden',
              backgroundColor: colors.background.elevated,
              marginRight: 12,
              flexShrink: 0,
            }}
          >
            {posterUri ? (
              <Image
                source={{ uri: posterUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {isMovie ? (
                  <Film size={20} color={colors.content.muted} />
                ) : (
                  <Tv size={20} color={colors.content.muted} />
                )}
              </View>
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.content.primary,
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {title ?? (isMovie ? 'Movie' : 'TV Show')}
            </Text>

            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}
            >
              <View
                style={{
                  backgroundColor: colors.background.elevated,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: colors.content.muted }}>
                  {isMovie ? 'Movie' : 'TV Show'}
                </Text>
              </View>
              {!isMovie && seasonCount > 0 && (
                <Text style={{ fontSize: 11, color: colors.content.muted }}>
                  {seasonCount} season{seasonCount !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            <Text style={{ fontSize: 11, color: colors.content.muted }}>{date}</Text>

            {/* Approve / Decline — admin only, pending only */}
            {showActions && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable
                  onPress={() => approve.mutate(item.id)}
                  disabled={approve.isPending || decline.isPending}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: colors.status.available + '20',
                    opacity: pressed || approve.isPending ? 0.6 : 1,
                  })}
                >
                  <Check size={13} color={colors.status.available} />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: colors.status.available }}>
                    Approve
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => decline.mutate(item.id)}
                  disabled={approve.isPending || decline.isPending}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: colors.status.declined + '20',
                    opacity: pressed || decline.isPending ? 0.6 : 1,
                  })}
                >
                  <X size={13} color={colors.status.declined} />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: colors.status.declined }}>
                    Decline
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Status — flex-shrink so it never expands */}
          <View style={{ marginLeft: 8, flexShrink: 0 }}>
            <RequestStatusDisplay
              requestStatus={item.status}
              mediaStatus={item.media.status}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={['top']}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.content.primary }}>
          My Requests
        </Text>
      </View>

      {/* Filter tabs — flexGrow:0 prevents expanding when list is empty */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        {FILTERS.map(({ label, value }) => (
          <Pressable
            key={value}
            onPress={() => setActiveFilter(value)}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 99,
                backgroundColor:
                  activeFilter === value ? colors.accent.DEFAULT : colors.background.elevated,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: activeFilter === value ? '#fff' : colors.content.secondary,
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* List */}
      {requests.length === 0 && !isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 15, color: colors.content.muted }}>No requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent.DEFAULT}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
