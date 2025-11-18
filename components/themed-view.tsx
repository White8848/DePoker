import { AppColors } from '@/constants/colors';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = AppColors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
