import create from "zustand";
import { persist } from "zustand/middleware";

let appStore = (set) => ({
  dopen: true,
  rows: [],
  isSnackBarVisible: false,
  snackBarText: "",
  setRows: (rows) => set((state) => ({ rows: rows })),
  updateDopen: (dopen) => set((state) => ({ dopen: dopen })),
  changeSnackBarVisibility: (val) => set(() => ({ isSnackBarVisible: val })),
  hideSnackBar: () => set({ isSnackBarVisible: false }),
  changeSnackBarText: (val) => set({ snackBarText: val }),
});

appStore = persist(appStore, { name: "cdot_store_api" });
export const useAppStore = create(appStore);
