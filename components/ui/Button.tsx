import { ActivityIndicator, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

export interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary:   { container: 'bg-accent',                        text: 'text-white' },
  secondary: { container: 'border border-accent bg-transparent', text: 'text-accent' },
  ghost:     { container: 'bg-transparent',                   text: 'text-accent' },
  danger:    { container: 'bg-status-declined',               text: 'text-white' },
};

const sizeStyles: Record<Size, { container: string; text: string; loaderSize: number }> = {
  lg: { container: 'h-12 px-6 rounded-xl', text: 'text-[17px] font-semibold', loaderSize: 20 },
  md: { container: 'h-10 px-4 rounded-lg', text: 'text-[15px] font-semibold', loaderSize: 18 },
  sm: { container: 'h-8  px-3 rounded-md', text: 'text-[13px] font-medium',   loaderSize: 16 },
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  async function handlePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={[
        'items-center justify-center flex-row',
        v.container,
        s.container,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ]
        .filter(Boolean)
        .join(' ')}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.8 : isDisabled ? 0.5 : 1 })}
    >
      {loading ? (
        <ActivityIndicator
          size={s.loaderSize}
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : colors.accent.DEFAULT}
        />
      ) : (
        <Text className={[v.text, s.text].join(' ')}>{children}</Text>
      )}
    </Pressable>
  );
}
