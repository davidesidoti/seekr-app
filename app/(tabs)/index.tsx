import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MediaRow } from '@/components/media';
import { useTrending, usePopularMovies, usePopularTv } from '@/hooks';
import { colors } from '@/theme';

export default function HomeScreen() {
  const trending = useTrending();
  const popularMovies = usePopularMovies();
  const popularTv = usePopularTv();

  const isRefreshing =
    trending.isRefetching || popularMovies.isRefetching || popularTv.isRefetching;

  function handleRefresh() {
    trending.refetch();
    popularMovies.refetch();
    popularTv.refetch();
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
        <View className="px-lg pt-lg pb-2xl">
          <Text className="text-h1 text-content-primary font-bold">Discover</Text>
        </View>

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

        {/* Bottom spacing */}
        <View className="h-xl" />
      </ScrollView>
    </SafeAreaView>
  );
}
