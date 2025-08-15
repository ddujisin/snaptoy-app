import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { PhotoTransformResponse } from "../types/api";
import { apiService, handleApiError } from "../services/api";
import { useCredits } from "../context/CreditContext";

interface TransformState {
  isTransforming: boolean;
  currentImage: string | null;
  result: PhotoTransformResponse | null;
  error: string | null;
  progress: string | null;
}

interface ImagePickerResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

export function usePhotoTransform() {
  const [state, setState] = useState<TransformState>({
    isTransforming: false,
    currentImage: null,
    result: null,
    error: null,
    progress: null,
  });

  const { creditState, consumeCredit, refreshBalance } = useCredits();

  // Reset state
  const reset = useCallback(() => {
    setState({
      isTransforming: false,
      currentImage: null,
      result: null,
      error: null,
      progress: null,
    });
  }, []);

  // Check camera permissions
  const requestCameraPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request camera permissions:", error);
      return false;
    }
  }, []);

  // Check media library permissions
  const requestMediaLibraryPermissions =
    useCallback(async (): Promise<boolean> => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
      } catch (error) {
        console.error("Failed to request media library permissions:", error);
        return false;
      }
    }, []);

  // Take photo with camera
  const takePhoto = useCallback(async (): Promise<ImagePickerResult> => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: "Camera permission is required to take photos.",
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { success: false, error: "Photo capture was cancelled." };
      }

      const imageUri = result.assets[0].uri;
      setState((prev) => ({ ...prev, currentImage: imageUri, error: null }));

      return { success: true, imageUri };
    } catch (error: any) {
      const errorMessage = "Failed to take photo. Please try again.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [requestCameraPermissions]);

  // Pick photo from gallery
  const pickPhoto = useCallback(async (): Promise<ImagePickerResult> => {
    try {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: "Photo library permission is required to select photos.",
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { success: false, error: "Photo selection was cancelled." };
      }

      const imageUri = result.assets[0].uri;
      setState((prev) => ({ ...prev, currentImage: imageUri, error: null }));

      return { success: true, imageUri };
    } catch (error: any) {
      const errorMessage = "Failed to pick photo. Please try again.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [requestMediaLibraryPermissions]);

  // Check if user has sufficient credits
  const checkCredits = useCallback((): boolean => {
    return creditState.photoCredits >= 1;
  }, [creditState.photoCredits]);

  // Transform photo with AI
  const transformPhoto = useCallback(
    async (
      backgroundType: "cartoon" | "lego" | "photo",
      customPrompt?: string
    ): Promise<{
      success: boolean;
      result?: PhotoTransformResponse;
      error?: string;
    }> => {
      try {
        // Check if we have a current image
        if (!state.currentImage) {
          const errorMessage =
            "No image selected. Please take or select a photo first.";
          setState((prev) => ({ ...prev, error: errorMessage }));
          return { success: false, error: errorMessage };
        }

        // Check credit balance
        if (!checkCredits()) {
          const errorMessage =
            "Insufficient credits. Please purchase more credits to continue.";
          setState((prev) => ({ ...prev, error: errorMessage }));
          return { success: false, error: errorMessage };
        }

        // Start transformation
        setState((prev) => ({
          ...prev,
          isTransforming: true,
          error: null,
          progress: "Uploading your photo...",
        }));

        // Optimistically consume credit
        consumeCredit();

        // Update progress
        setState((prev) => ({
          ...prev,
          progress: "AI is working its magic...",
        }));

        // Make API call
        const result = await apiService.transformPhoto(
          state.currentImage,
          backgroundType,
          customPrompt
        );

        setState((prev) => ({
          ...prev,
          isTransforming: false,
          result,
          progress: null,
        }));

        // Refresh balance to ensure accuracy
        await refreshBalance();

        return { success: true, result };
      } catch (error: any) {
        const errorMessage = handleApiError(error);

        setState((prev) => ({
          ...prev,
          isTransforming: false,
          error: errorMessage,
          progress: null,
        }));

        // Refresh balance in case of error to restore credit if needed
        await refreshBalance();

        return { success: false, error: errorMessage };
      }
    },
    [state.currentImage, checkCredits, consumeCredit, refreshBalance]
  );

  // Set current image manually (useful for testing or external image sources)
  const setCurrentImage = useCallback((imageUri: string | null) => {
    setState((prev) => ({ ...prev, currentImage: imageUri, error: null }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isTransforming: state.isTransforming,
    currentImage: state.currentImage,
    result: state.result,
    error: state.error,
    progress: state.progress,
    hasCredits: checkCredits(),

    // Actions
    takePhoto,
    pickPhoto,
    transformPhoto,
    setCurrentImage,
    clearError,
    reset,

    // Permission helpers
    requestCameraPermissions,
    requestMediaLibraryPermissions,
  };
}
