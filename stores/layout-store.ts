import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LayoutState {
  isSidebarOpen: boolean;
  isOpenRightSider: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsOpenRightSider: (isOpen: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isOpenRightSider: false,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setIsOpenRightSider: (isOpen) => set({ isOpenRightSider: isOpen }),
    }),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
