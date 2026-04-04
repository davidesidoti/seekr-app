import { useState, forwardRef } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, icon: Icon, style, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.status.declined
    : focused
      ? colors.accent.DEFAULT
      : colors.border.DEFAULT;

  return (
    <View className="w-full">
      {label && (
        <Text className="text-body-sm text-content-secondary mb-sm font-medium">{label}</Text>
      )}

      <View
        className="flex-row items-center h-12 rounded-lg bg-background-input px-lg"
        style={{ borderWidth: 1, borderColor }}
      >
        {Icon && (
          <Icon
            size={18}
            color={focused ? colors.accent.DEFAULT : colors.content.muted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          ref={ref}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 text-content-primary text-body"
          placeholderTextColor={colors.content.muted}
          style={[{ height: '100%' }, style]}
        />
      </View>

      {error && (
        <Text className="text-caption text-status-declined mt-xs">{error}</Text>
      )}
    </View>
  );
});
