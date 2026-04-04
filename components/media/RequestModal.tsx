import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import { colors } from '@/theme';
import { MediaStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { useCreateRequest } from '@/hooks';
import type { Season, MediaInfo } from '@/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  seasons?: Season[];
  mediaInfo?: MediaInfo;
}

export function RequestModal({
  visible,
  onClose,
  mediaId,
  mediaType,
  title,
  seasons,
  mediaInfo,
}: RequestModalProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const { mutate, isPending, reset } = useCreateRequest();

  function getSeasonStatus(seasonNumber: number) {
    return (
      mediaInfo?.seasons?.find((s) => s.seasonNumber === seasonNumber)?.status ??
      MediaStatus.UNKNOWN
    );
  }

  function buildRequestableSeasons(s: Season[] | undefined, info: MediaInfo | undefined) {
    return (s ?? []).filter(
      (season) =>
        season.seasonNumber > 0 &&
        ((info?.seasons?.find((si) => si.seasonNumber === season.seasonNumber)?.status ??
          MediaStatus.UNKNOWN) === MediaStatus.UNKNOWN),
    );
  }

  const [selectedSeasons, setSelectedSeasons] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (visible) {
      reset();
      const requestable = buildRequestableSeasons(seasons, mediaInfo);
      setSelectedSeasons(new Set(requestable.map((s) => s.seasonNumber)));
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  function handleClose() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  }

  function toggleSeason(seasonNumber: number) {
    setSelectedSeasons((prev) => {
      const next = new Set(prev);
      if (next.has(seasonNumber)) next.delete(seasonNumber);
      else next.add(seasonNumber);
      return next;
    });
  }

  function handleSubmit() {
    if (mediaType === 'movie') {
      mutate({ mediaType: 'movie', mediaId, is4k: false }, { onSuccess: handleClose });
    } else {
      const seasonNumbers = Array.from(selectedSeasons).sort((a, b) => a - b);
      if (seasonNumbers.length === 0) return;
      mutate(
        { mediaType: 'tv', mediaId, is4k: false, seasons: seasonNumbers },
        { onSuccess: handleClose },
      );
    }
  }

  const requestableSeasons = buildRequestableSeasons(seasons, mediaInfo);
  const allSelected =
    requestableSeasons.length > 0 &&
    requestableSeasons.every((s) => selectedSeasons.has(s.seasonNumber));
  const canSubmit = mediaType === 'movie' || selectedSeasons.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedSeasons(new Set());
    } else {
      setSelectedSeasons(new Set(requestableSeasons.map((s) => s.seasonNumber)));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={handleClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.background.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom + 16,
            },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border.DEFAULT,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 12,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '600',
                color: colors.content.primary,
                marginRight: 12,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Pressable
              onPress={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.background.elevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={colors.content.muted} />
            </Pressable>
          </View>

          {/* Movie */}
          {mediaType === 'movie' && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={{ fontSize: 15, color: colors.content.secondary, lineHeight: 22 }}>
                Request this movie to be added to your library?
              </Text>
            </View>
          )}

          {/* TV season selector */}
          {mediaType === 'tv' && seasons && (
            <>
              {requestableSeasons.length > 1 && (
                <Pressable
                  onPress={toggleSelectAll}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.border.DEFAULT,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: allSelected ? colors.accent.DEFAULT : 'transparent',
                      borderColor: allSelected ? colors.accent.DEFAULT : colors.border.DEFAULT,
                    }}
                  >
                    {allSelected && <Check size={12} color="#fff" />}
                  </View>
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: colors.content.primary }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All Seasons'}
                  </Text>
                </Pressable>
              )}

              <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                {seasons
                  .filter((s) => s.seasonNumber > 0)
                  .map((season) => {
                    const status = getSeasonStatus(season.seasonNumber);
                    const isRequestable = status === MediaStatus.UNKNOWN;
                    const isSelected = selectedSeasons.has(season.seasonNumber);

                    return (
                      <Pressable
                        key={season.seasonNumber}
                        onPress={() => isRequestable && toggleSeason(season.seasonNumber)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderBottomWidth: 0.5,
                          borderBottomColor: colors.border.DEFAULT + '50',
                          opacity: isRequestable ? 1 : 0.5,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 1.5,
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              isSelected && isRequestable ? colors.accent.DEFAULT : 'transparent',
                            borderColor:
                              isSelected && isRequestable
                                ? colors.accent.DEFAULT
                                : colors.border.DEFAULT,
                          }}
                        >
                          {isSelected && isRequestable && <Check size={12} color="#fff" />}
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: colors.content.primary,
                            }}
                          >
                            {season.name}
                          </Text>
                          <Text
                            style={{ fontSize: 12, color: colors.content.muted, marginTop: 2 }}
                          >
                            {season.episodeCount} episodes
                          </Text>
                        </View>

                        {!isRequestable && <StatusBadge status={status} />}
                      </Pressable>
                    );
                  })}
              </ScrollView>
            </>
          )}

          {/* Submit */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isPending}
              style={({ pressed }) => ({
                backgroundColor: colors.accent.DEFAULT,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: pressed || !canSubmit || isPending ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>
                {isPending
                  ? 'Requesting…'
                  : mediaType === 'tv'
                  ? `Request ${selectedSeasons.size} Season${selectedSeasons.size !== 1 ? 's' : ''}`
                  : 'Request'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
