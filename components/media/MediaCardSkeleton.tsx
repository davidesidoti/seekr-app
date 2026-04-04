import { View } from 'react-native';
import { Skeleton } from '@/components/ui';

const CARD_WIDTH = 130;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.5);

export function MediaCardSkeleton() {
  return (
    <View style={{ width: CARD_WIDTH }}>
      <Skeleton width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={8} />
      <Skeleton width={CARD_WIDTH} height={12} borderRadius={4} style={{ marginTop: 6 }} />
      <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
  );
}
