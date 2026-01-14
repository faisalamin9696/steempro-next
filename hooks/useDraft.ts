import { empty_draft } from "@/constants/templates";
import moment from "moment";
import { useState, useEffect, useCallback, useRef } from "react";

interface UseDraftOptions {
  autoLoad?: boolean;
  autoSave?: boolean;
  saveDebounce?: number;
}

const DEFAULT_OPTIONS: UseDraftOptions = {
  autoLoad: true,
  autoSave: true,
  saveDebounce: 500,
};

export const useDraft = (
  draftKey: string,
  options: UseDraftOptions = DEFAULT_OPTIONS
) => {
  const { autoLoad, autoSave, saveDebounce } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [draft, setDraft] = useState<DraftData>(empty_draft);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Save timeout reference
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate the localStorage key
  const getStorageKey = useCallback(() => {
    return `draft_${draftKey}`;
  }, [draftKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(
    (data: DraftData) => {
      if (typeof window === "undefined") return false;
      try {
        const storageKey = getStorageKey();
        const draftToSave = {
          ...data,
          updatedAt: moment().unix(),
        };

        localStorage.setItem(storageKey, JSON.stringify(draftToSave));
        setLastSaved(draftToSave.updatedAt);
        console.log(`Draft saved for key: ${draftKey}`);
        return true;
      } catch (error) {
        console.error("Error saving draft:", error);
        return false;
      }
    },
    [getStorageKey, draftKey]
  );

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    if (typeof window === "undefined") return empty_draft;
    setIsLoading(true);
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsedData = JSON.parse(saved) as DraftData;

        // Validate the loaded data structure
        if (
          typeof parsedData.title === "string" &&
          typeof parsedData.body === "string" &&
          Array.isArray(parsedData.tags) &&
          Array.isArray(parsedData.beneficiaries) &&
          typeof parsedData.updatedAt === "number"
        ) {
          setDraft(parsedData);
          console.log(`Draft loaded for key: ${draftKey}`);
          return parsedData;
        } else {
          console.warn("Invalid draft data structure");
          clearDraft();
          return empty_draft;
        }
      }
      return empty_draft;
    } catch (error) {
      console.error("Error loading draft:", error);
      return empty_draft;
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, draftKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      setDraft(empty_draft);
      setLastSaved(null);
      console.log(`Draft cleared for key: ${draftKey}`);
      return true;
    } catch (error) {
      console.error("Error clearing draft:", error);
      return false;
    }
  }, [getStorageKey, draftKey]);

  // Get draft without loading it (useful for checking if draft exists)
  const getDraft = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        return JSON.parse(saved) as DraftData;
      }
      return null;
    } catch (error) {
      console.error("Error getting draft:", error);
      return null;
    }
  }, [getStorageKey]);

  // Update draft with auto-save functionality
  const updateDraft = useCallback(
    (updates: Partial<DraftData>) => {
      setDraft((prev) => {
        const newDraft = prev ? { ...prev, ...updates } : null;

        if (!newDraft) return empty_draft;

        // Auto-save with debounce if enabled
        if (autoSave) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          saveTimeoutRef.current = setTimeout(() => {
            saveDraft(newDraft);
          }, saveDebounce);
        }

        return newDraft;
      });
    },
    [autoSave, saveDebounce, saveDraft]
  );

  // Initialize with draft data
  const initializeDraft = useCallback(
    (initialData: Partial<DraftData> = {}) => {
      const baseDraft: DraftData = {
        ...empty_draft,
        ...initialData,
      };

      setDraft(baseDraft);
      return baseDraft;
    },
    []
  );

  // Load draft manually
  const loadDraftManually = useCallback(() => {
    return loadDraft();
  }, [loadDraft]);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    const draftData = getDraft();
    return draftData !== null;
  }, [getDraft]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadDraft();
    }
  }, [autoLoad, loadDraft]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    draft,
    isLoading,
    lastSaved,

    // Actions
    saveDraft: () => (draft ? saveDraft(draft) : false),
    loadDraft: loadDraftManually,
    clearDraft,
    getDraft,
    updateDraft,
    initializeDraft,
    hasDraft: hasDraft(),

    // Helper methods for individual properties
    setTitle: (title: string) => updateDraft({ title }),
    setBody: (body: string) => updateDraft({ body }),
    setTags: (tags: string[]) => updateDraft({ tags }),
    setCommunity: (community: Community | undefined) =>
      updateDraft({ community }),
    setBeneficiaries: (beneficiaries: Beneficiary[]) =>
      updateDraft({ beneficiaries }),
  };
};

// Helper function to get draft without using the hook (for use outside components)
export const getDraftFromStorage = (draftKey: string): DraftData | null => {
  if (typeof window === "undefined") return null;
  try {
    const storageKey = `draft_${draftKey}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      return JSON.parse(saved) as DraftData;
    }
    return null;
  } catch (error) {
    console.error("Error getting draft from storage:", error);
    return null;
  }
};

// Helper function to save draft without using the hook
export const saveDraftToStorage = (
  draftKey: string,
  data: DraftData
): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const storageKey = `draft_${draftKey}`;
    const draftToSave = {
      ...data,
      updatedAt: moment().unix(),
    };

    localStorage.setItem(storageKey, JSON.stringify(draftToSave));
    return true;
  } catch (error) {
    console.error("Error saving draft to storage:", error);
    return false;
  }
};
