import { View, Text } from 'react-native';
import { MediaStatus, type MediaStatusValue } from '@/types';
import { colors } from '@/theme';

interface Config {
  label: string;
  bg: string;
}

const STATUS_CONFIG: Partial<Record<MediaStatusValue, Config>> = {
  [MediaStatus.AVAILABLE]:           { label: 'Available',           bg: colors.status.available },
  [MediaStatus.PARTIALLY_AVAILABLE]: { label: 'Partially Available', bg: colors.status.partial },
  [MediaStatus.PENDING]:             { label: 'Pending',             bg: colors.status.pending },
  [MediaStatus.PROCESSING]:          { label: 'Processing',          bg: colors.status.processing },
};

export interface StatusBadgeProps {
  status: MediaStatusValue;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <View
      className="rounded-full px-sm py-xs"
      style={{ backgroundColor: config.bg, alignSelf: 'flex-start' }}
    >
      <Text className="text-caption text-white font-medium">{config.label}</Text>
    </View>
  );
}
