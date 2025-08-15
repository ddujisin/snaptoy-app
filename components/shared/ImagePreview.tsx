import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";

interface ImagePreviewProps {
  uri: string;
  onRemove?: () => void;
  onEdit?: () => void;
  style?: any;
  showActions?: boolean;
  aspectRatio?: number;
}

export default function ImagePreview({
  uri,
  onRemove,
  onEdit,
  style,
  showActions = true,
  aspectRatio = 4 / 3,
}: ImagePreviewProps) {
  return (
    <View style={[styles.container, { aspectRatio }, style]}>
      <Image source={{ uri }} style={styles.image} />

      {showActions && (
        <View style={styles.actionsOverlay}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEdit}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="pencil" size={16} color={COLORS.background} />
            </TouchableOpacity>
          )}

          {onRemove && (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={onRemove}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={16} color={COLORS.background} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  actionsOverlay: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.xs,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  removeButton: {
    backgroundColor: COLORS.error,
  },
});
