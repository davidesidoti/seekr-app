import { useState } from 'react';
import { ScrollView, RefreshControl, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MediaRow } from '@/components/media';
import { useTrending, usePopularMovies, usePopularTv } from '@/hooks';
import { colors } from '@/theme';

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popularity.desc' },
  { label: 'Top Rated', value: 'vote_average.desc' },
  { label: 'New', value: 'primary_release_date.desc' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

// Genres that exist in both TMDB movie and TV catalogs (shared ID where applicable).
// movieId: TMDB genre for /discover/movies
// tvId: TMDB genre for /discover/tv (null = no direct equivalent, row is unfiltered)
const GENRES = [
  { label: 'Action',      movieId: 28,    tvId: 10759 },
  { label: 'Comedy',      movieId: 35,    tvId: 35    },
  { label: 'Drama',       movieId: 18,    tvId: 18    },
  { label: 'Horror',      movieId: 27,    tvId: null  },
  { label: 'Sci-Fi',      movieId: 878,   tvId: 10765 },
  { label: 'Animation',   movieId: 16,    tvId: 16    },
  { label: 'Documentary', movieId: 99,    tvId: 99    },
  { label: 'Crime',       movieId: 80,    tvId: 80    },
  { label: 'Mystery',     movieId: 9648,  tvId: 9648  },
  { label: 'Thriller',    movieId: 53,    tvId: null  },
  { label: 'Family',      movieId: 10751, tvId: 10751 },
  { label: 'Romance',     movieId: 10749, tvId: null  },
] as const;

type GenreIndex = number | null; // index into GENRES, null = no filter

export default function HomeScreen() {
  const [sort, setSort] = useState<SortValue>('popularity.desc');
  const [genreIdx, setGenreIdx] = useState<GenreIndex>(null);

  const selectedGenre = genreIdx !== null ? GENRES[genreIdx] : null;
  const movieGenre = selectedGenre?.movieId ?? undefined;
  const tvGenre = selectedGenre?.tvId ?? undefined;

  const trending = useTrending();
  const popularMovies = usePopularMovies(sort, movieGenre);
  const popularTv = usePopularTv(sort, tvGenre);

  const isRefreshing =
    trending.isRefetching || popularMovies.isRefetching || popularTv.isRefetching;

  function handleRefresh() {
    trending.refetch();
    popularMovies.refetch();
    popularTv.refetch();
  }

  function toggleGenre(idx: number) {
    setGenreIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-lg pt-lg pb-md">
          <Text className="text-h1 text-content-primary font-bold">Discover</Text>
        </View>

        {/* Sort tabs */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            gap: 8,
            paddingBottom: 10,
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => setSort(opt.value)}>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 99,
                  backgroundColor:
                    sort === opt.value ? colors.accent.DEFAULT : colors.background.elevated,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: sort === opt.value ? '#fff' : colors.content.secondary,
                  }}
                >
                  {opt.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Genre filter row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, flexShrink: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 4,
            paddingBottom: 14,
            gap: 8,
          }}
        >
          {GENRES.map((genre, idx) => {
            const active = genreIdx === idx;
            return (
              <Pressable key={genre.label} onPress={() => toggleGenre(idx)}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 99,
                    borderWidth: 1,
                    borderColor: active ? colors.accent.DEFAULT : colors.border.DEFAULT,
                    backgroundColor: active
                      ? colors.accent.DEFAULT + '20'
                      : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: active ? colors.accent.DEFAULT : colors.content.muted,
                    }}
                  >
                    {genre.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <MediaRow
          title="Trending"
          data={trending.data?.results}
          isLoading={trending.isLoading}
        />
        <MediaRow
          title="Popular Movies"
          data={popularMovies.data?.results}
          isLoading={popularMovies.isLoading}
        />
        <MediaRow
          title="Popular TV Shows"
          data={popularTv.data?.results}
          isLoading={popularTv.isLoading}
        />

        <View className="h-xl" />
      </ScrollView>
    </SafeAreaView>
  );
}
