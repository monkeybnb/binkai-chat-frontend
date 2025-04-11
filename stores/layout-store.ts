import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LayoutState {
  isSidebarOpen: boolean;
  isOpenRightSider: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  setIsOpenRightSider: (value: boolean) => void;
}

const getDefaultState = () => {
  if (typeof window === "undefined") {
    return {
      isSidebarOpen: false,
    };
  }
  return {
    isSidebarOpen: window.innerWidth >= 768,
  };
};

// Create store with persistence only for isSidebarOpen
export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      ...getDefaultState(),
      isOpenRightSider: false, // This won't be persisted due to partialize
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setIsOpenRightSider: (isOpen) => set({ isOpenRightSider: isOpen }),
    }),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }), // Only persist isSidebarOpen
    }
  )
);
