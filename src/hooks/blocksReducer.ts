// hooks/blocksReducer.ts
import type { Block, GridItem } from "@/components/admin/Types";

export const MAX_GRID_ITEMS = 12;

export type BlockAction =
  | { type: "SET"; blocks: Block[] }
  | { type: "INSERT"; blocks: Block[]; at: number }
  | { type: "REMOVE"; key: string }
  | { type: "MOVE"; key: string; dir: -1 | 1 }
  | { type: "CAPTION"; key: string; caption: string }
  | { type: "PROGRESS"; key: string; itemKey?: string; progress: number }
  | { type: "UPLOADED"; key: string; itemKey?: string; url: string }
  | { type: "GRID_ADD"; key: string; items: GridItem[] }
  | { type: "GRID_REMOVE"; key: string; itemKey: string }
  | { type: "GRID_COLUMNS"; key: string; columns: number };

const mapBlock = (state: Block[], key: string, fn: (b: Block) => Block): Block[] =>
  state.map((b) => (b._key === key ? fn(b) : b));

export function blocksReducer(state: Block[], action: BlockAction): Block[] {
  switch (action.type) {
    case "SET":
      return action.blocks;

    case "INSERT": {
      const at = Math.max(0, Math.min(action.at, state.length));
      return [...state.slice(0, at), ...action.blocks, ...state.slice(at)];
    }

    case "REMOVE":
      return state.filter((b) => b._key !== action.key);

    case "MOVE": {
      const i = state.findIndex((b) => b._key === action.key);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= state.length) return state;
      const next = [...state];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }

    case "CAPTION":
      return mapBlock(state, action.key, (b) => ({ ...b, caption: action.caption }));

    case "PROGRESS":
      return mapBlock(state, action.key, (b) => {
        if (b.type === "grid" && action.itemKey) {
          return {
            ...b,
            items: b.items.map((it) =>
              it._key === action.itemKey ? { ...it, uploadProgress: action.progress } : it
            ),
          };
        }
        if (b.type === "image" || b.type === "video") {
          return { ...b, uploadProgress: action.progress };
        }
        return b;
      });

    case "UPLOADED":
      return mapBlock(state, action.key, (b) => {
        if (b.type === "grid" && action.itemKey) {
          return {
            ...b,
            items: b.items.map((it) =>
              it._key === action.itemKey ? { ...it, uploadedUrl: action.url } : it
            ),
          };
        }
        if (b.type === "image" || b.type === "video") {
          return { ...b, uploadedUrl: action.url };
        }
        return b;
      });

    case "GRID_ADD":
      return mapBlock(state, action.key, (b) =>
        b.type === "grid"
          ? { ...b, items: [...b.items, ...action.items].slice(0, MAX_GRID_ITEMS) }
          : b
      );

    case "GRID_REMOVE": {
      const next = mapBlock(state, action.key, (b) =>
        b.type === "grid"
          ? { ...b, items: b.items.filter((it) => it._key !== action.itemKey) }
          : b
      );
      // شبكة بلا عناصر تُحذف
      return next.filter((b) => !(b.type === "grid" && b.items.length === 0));
    }

    case "GRID_COLUMNS":
      return mapBlock(state, action.key, (b) =>
        b.type === "grid"
          ? { ...b, columns: Math.max(1, Math.min(4, Math.round(action.columns))) }
          : b
      );

    default:
      return state;
  }
}
