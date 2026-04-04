import { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { Input } from '@/components/ui';
import { MediaCard } from '@/components/media';
import { useSearch } from '@/hooks';
import { colors } from '@/theme';
import type { MediaResult } from '@/types';

const NUM_COLUMNS = 2;
const SIDE_PADDING = 16;
const COLUMN_GAP = 12;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - SIDE_PADDING * 2 - COLUMN_GAP) / NUM_COLUMNS);

export default function SearchScreen() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useSearch(debouncedQuery);

  function handleChangeText(text: string) {
    setInputValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text), 300);
  }

  function handleClear() {
    setInputValue('');
    setDebouncedQuery('');
  }

  const renderItem = useCallback(
    ({ item }: { item: MediaResult }) => (
      <View style={{ paddingBottom: COLUMN_GAP, paddingHorizontal: COLUMN_GAP / 2 }}>
        <MediaCard item={item} width={CARD_WIDTH} />
      </View>
    ),
    [],
  );

  const results = data?.results ?? [];
  const showEmpty = debouncedQuery.length >= 3 && !isLoading && results.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      {/* Search bar */}
      <View className="px-lg pt-lg pb-md">
        <Input
          icon={SearchIcon}
          placeholder="Search movies and TV shows…"
          value={inputValue}
          onChangeText={handleChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {inputValue.length > 0 && (
          <Pressable
            onPress={handleClear}
            className="absolute right-lg+md top-lg+md p-sm"
            style={{ right: 28, top: 28 }}
          >
            <X size={16} color={colors.content.muted} />
          </Pressable>
        )}
      </View>

      {/* Results */}
      {showEmpty ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-body text-content-muted">No results for "{debouncedQuery}"</Text>
        </View>
      ) : debouncedQuery.length < 3 ? (
        <View className="flex-1 items-center justify-center">
          <SearchIcon size={48} color={colors.content.muted} />
          <Text className="text-body text-content-muted mt-md">Search for movies and TV shows</Text>
        </View>
      ) : (
        <FlashList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING - COLUMN_GAP / 2, paddingTop: 8 }}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
