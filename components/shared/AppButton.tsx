import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? COLORS.disabled : COLORS.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? COLORS.disabled : COLORS.secondary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: isDisabled ? COLORS.disabled : COLORS.primary,
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? COLORS.disabled : COLORS.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    switch (variant) {
      case "outline":
        return {
          ...baseTextStyle,
          color: isDisabled ? COLORS.disabled : COLORS.primary,
        };
      default:
        return {
          ...baseTextStyle,
          color: isDisabled ? COLORS.background : COLORS.background,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? COLORS.primary : COLORS.background}
        />
      ) : (
        <>
          {icon}
                     <Text
             style={[getTextStyle(), textStyle, ...(icon ? [styles.textWithIcon] : [])]}
           >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
  },

  // Size variants
  smallButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 52,
  },

  // Text styles
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: "center",
  },
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  textWithIcon: {
    marginLeft: SPACING.sm,
  },
});
