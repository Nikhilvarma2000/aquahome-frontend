import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: any
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  // Determine button background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return '#ccc';

    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return 'transparent';
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return '#666';

    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
        return colors.primary;
      case 'outline':
        return colors.primary;
      case 'danger':
        return '#fff';
      default:
        return '#fff';
    }
  };

  // Determine border based on variant
  const getBorderStyle = () => {
    switch (variant) {
      case 'outline':
      case 'secondary':
        return {
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'danger':
        return {
          // borderWidth: variant === 'outline' ? 1 : 0,
          borderWidth: 1,
          borderColor: colors.error,
        };
      default:
        return {};
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 20 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        getPadding(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;