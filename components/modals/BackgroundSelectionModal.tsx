import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";
import { BACKGROUND_TYPES } from "../../constants/api";
import { EXAMPLE_PROMPTS, PROMPT_GUIDELINES } from "../../constants/prompts";
import AppButton from "../shared/AppButton";

interface BackgroundSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    backgroundType: "cartoon" | "lego" | "photo",
    customPrompt?: string
  ) => void;
  loading?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

export default function BackgroundSelectionModal({
  visible,
  onClose,
  onConfirm,
  loading = false,
}: BackgroundSelectionModalProps) {
  const [selectedBackground, setSelectedBackground] = useState<
    "cartoon" | "lego" | "photo"
  >("cartoon");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  const handleConfirm = () => {
    const prompt = customPrompt.trim();
    onConfirm(selectedBackground, prompt || undefined);
  };

  const handlePromptExamplePress = (example: string) => {
    setCustomPrompt(example);
    setShowExamples(false);
  };

  const renderBackgroundOption = (type: "cartoon" | "lego" | "photo") => {
    const config = BACKGROUND_TYPES[type];
    const isSelected = selectedBackground === type;

    return (
      <TouchableOpacity
        key={type}
        style={[styles.backgroundOption, isSelected && styles.selectedOption]}
        onPress={() => setSelectedBackground(type)}
        activeOpacity={0.8}
      >
        <Text style={styles.backgroundEmoji}>{config.emoji}</Text>
        <Text
          style={[styles.backgroundName, isSelected && styles.selectedText]}
        >
          {config.name}
        </Text>
        <Text
          style={[
            styles.backgroundDescription,
            isSelected && styles.selectedDescription,
          ]}
        >
          {config.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderExamplePrompts = () => {
    const examples = EXAMPLE_PROMPTS[selectedBackground];

    return (
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Tap an example to use it:</Text>
        <ScrollView
          style={styles.examplesList}
          showsVerticalScrollIndicator={false}
        >
          {examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleItem}
              onPress={() => handlePromptExamplePress(example)}
              activeOpacity={0.7}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Background</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Background Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Background Style</Text>
              <View style={styles.backgroundOptions}>
                {Object.keys(BACKGROUND_TYPES).map((type) =>
                  renderBackgroundOption(type as "cartoon" | "lego" | "photo")
                )}
              </View>
            </View>

            {/* Custom Prompt Section */}
            <View style={styles.section}>
              <View style={styles.promptHeader}>
                <Text style={styles.sectionTitle}>
                  Custom Description (Optional)
                </Text>
                <TouchableOpacity
                  style={styles.examplesButton}
                  onPress={() => setShowExamples(!showExamples)}
                >
                  <Text style={styles.examplesButtonText}>
                    {showExamples ? "Hide" : "Show"} Examples
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.promptInput}
                placeholder={`Describe your perfect ${selectedBackground} background...`}
                placeholderTextColor={COLORS.textSecondary}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
                maxLength={PROMPT_GUIDELINES.maxLength}
                textAlignVertical="top"
              />

              <View style={styles.promptInfo}>
                <Text style={styles.characterCount}>
                  {customPrompt.length}/{PROMPT_GUIDELINES.maxLength}
                </Text>
                <Text style={styles.promptTip}>
                  💡 Be specific about colors, objects, and atmosphere
                </Text>
              </View>

              {showExamples && renderExamplePrompts()}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <AppButton
              title="Create Magic! ✨"
              onPress={handleConfirm}
              loading={loading}
              style={styles.confirmButton}
            />
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  backgroundOptions: {
    gap: SPACING.md,
  },
  backgroundOption: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: "center",
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  backgroundEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  backgroundName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  selectedText: {
    color: COLORS.primary,
  },
  backgroundDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  selectedDescription: {
    color: COLORS.text,
  },
  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  examplesButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + "20",
    borderRadius: BORDER_RADIUS.sm,
  },
  examplesButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  promptInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  promptInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  promptTip: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  examplesContainer: {
    marginTop: SPACING.lg,
  },
  examplesTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  examplesList: {
    maxHeight: 150,
  },
  exampleItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exampleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
});
