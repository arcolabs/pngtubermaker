import { create } from "zustand";

interface BuyCreditsModalState {
  isOpen: boolean;
  requiredCredits: number | null;
  open: (requiredCredits?: number) => void;
  close: () => void;
}

export const useBuyCreditsModal = create<BuyCreditsModalState>((set) => ({
  isOpen: false,
  requiredCredits: null,
  open: (requiredCredits) =>
    set({ isOpen: true, requiredCredits: requiredCredits ?? null }),
  close: () => set({ isOpen: false, requiredCredits: null }),
}));
