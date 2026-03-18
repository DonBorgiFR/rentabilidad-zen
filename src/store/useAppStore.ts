import { create } from 'zustand';

interface AppState {
  isDark: boolean;
  activeTab: 'landlord' | 'tenant' | null;
  isExporting: boolean;
  feedbackGiven: boolean;
  isSubmittingFeedback: boolean;
  setIsDark: (val: boolean) => void;
  setActiveTab: (val: 'landlord' | 'tenant' | null) => void;
  setIsExporting: (val: boolean) => void;
  setFeedbackGiven: (val: boolean) => void;
  setIsSubmittingFeedback: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDark: true,
  activeTab: null,
  isExporting: false,
  feedbackGiven: false,
  isSubmittingFeedback: false,
  setIsDark: (isDark) => set({ isDark }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setFeedbackGiven: (feedbackGiven) => set({ feedbackGiven }),
  setIsSubmittingFeedback: (isSubmittingFeedback) => set({ isSubmittingFeedback }),
}));
