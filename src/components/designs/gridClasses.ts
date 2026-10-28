// components/designs/gridClasses.ts
// أصناف ثابتة (Tailwind لا يرى الأصناف المركّبة ديناميكياً). في components/ ليمسحها Tailwind.
export const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};
