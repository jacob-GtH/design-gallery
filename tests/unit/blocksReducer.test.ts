import { describe, expect, it } from "vitest";
import { MAX_GRID_ITEMS, blocksReducer } from "@/hooks/blocksReducer";
import type { Block, GridItem } from "@/components/admin/Types";

const image = (k: string, extra: Record<string, unknown> = {}): Block =>
  ({ type: "image", _key: k, file: null, previewUrl: "", caption: "", ...extra }) as Block;
const text = (k: string): Block => ({ type: "text", _key: k, caption: "" });
const gi = (k: string): GridItem => ({ _key: k, file: null, previewUrl: "" });
const grid = (k: string, items: GridItem[], columns = 2): Block => ({ type: "grid", _key: k, columns, items, caption: "" });
const keys = (s: Block[]) => s.map((b) => b._key).join(",");

describe("blocksReducer", () => {
  const base = [image("a"), text("b"), image("c")];

  it("SET يستبدل كل شيء", () => {
    expect(keys(blocksReducer(base, { type: "SET", blocks: [text("z")] }))).toBe("z");
  });

  describe("INSERT", () => {
    it("في الوسط وفي البداية وفي النهاية", () => {
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x")], at: 1 }))).toBe("a,x,b,c");
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x")], at: 0 }))).toBe("x,a,b,c");
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x")], at: 3 }))).toBe("a,b,c,x");
    });
    it("الموضع خارج النطاق يُقصّ", () => {
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x")], at: 99 }))).toBe("a,b,c,x");
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x")], at: -5 }))).toBe("x,a,b,c");
    });
    it("يدرج عدة كتل بترتيبها", () => {
      expect(keys(blocksReducer(base, { type: "INSERT", blocks: [text("x"), text("y")], at: 1 }))).toBe("a,x,y,b,c");
    });
  });

  it("REMOVE يحذف بالمفتاح، ومفتاح غير موجود لا يغيّر شيئاً", () => {
    expect(keys(blocksReducer(base, { type: "REMOVE", key: "b" }))).toBe("a,c");
    expect(keys(blocksReducer(base, { type: "REMOVE", key: "ghost" }))).toBe("a,b,c");
  });

  describe("MOVE", () => {
    it("لأعلى ولأسفل", () => {
      expect(keys(blocksReducer(base, { type: "MOVE", key: "b", dir: -1 }))).toBe("b,a,c");
      expect(keys(blocksReducer(base, { type: "MOVE", key: "b", dir: 1 }))).toBe("a,c,b");
    });
    it("عند الحدود أو بمفتاح مجهول يعيد نفس الحالة", () => {
      expect(blocksReducer(base, { type: "MOVE", key: "a", dir: -1 })).toBe(base);
      expect(blocksReducer(base, { type: "MOVE", key: "c", dir: 1 })).toBe(base);
      expect(blocksReducer(base, { type: "MOVE", key: "ghost", dir: 1 })).toBe(base);
    });
    it("لا يعدّل المصفوفة الأصلية", () => {
      blocksReducer(base, { type: "MOVE", key: "a", dir: 1 });
      expect(keys(base)).toBe("a,b,c");
    });
  });

  it("CAPTION يعدّل الكتلة المقصودة فقط", () => {
    const r = blocksReducer(base, { type: "CAPTION", key: "b", caption: "<p>x</p>" });
    expect(r[1].caption).toBe("<p>x</p>");
    expect(r[0].caption).toBe("");
  });

  describe("PROGRESS / UPLOADED", () => {
    it("صورة: على الكتلة نفسها", () => {
      let r = blocksReducer(base, { type: "PROGRESS", key: "a", progress: 40 });
      r = blocksReducer(r, { type: "UPLOADED", key: "a", url: "https://u" });
      expect(r[0]).toMatchObject({ uploadProgress: 40, uploadedUrl: "https://u" });
    });
    it("شبكة: على العنصر المحدد فقط", () => {
      const s = [grid("g", [gi("1"), gi("2")])];
      let r = blocksReducer(s, { type: "PROGRESS", key: "g", itemKey: "2", progress: 70 });
      r = blocksReducer(r, { type: "UPLOADED", key: "g", itemKey: "2", url: "https://u2" });
      const g = r[0] as Extract<Block, { type: "grid" }>;
      expect(g.items[1]).toMatchObject({ uploadProgress: 70, uploadedUrl: "https://u2" });
      expect(g.items[0].uploadProgress).toBeUndefined();
    });
    it("كتلة نصية تتجاهلها", () => {
      expect(blocksReducer(base, { type: "PROGRESS", key: "b", progress: 10 })[1]).toEqual(base[1]);
      expect(blocksReducer(base, { type: "UPLOADED", key: "b", url: "x" })[1]).toEqual(base[1]);
    });
  });

  describe("الشبكة", () => {
    it("GRID_ADD يضيف ويقصّ عند الحد الأقصى", () => {
      const s = [grid("g", [gi("1")])];
      const many = Array.from({ length: 20 }, (_, i) => gi(`n${i}`));
      const r = blocksReducer(s, { type: "GRID_ADD", key: "g", items: many });
      expect((r[0] as Extract<Block, { type: "grid" }>).items).toHaveLength(MAX_GRID_ITEMS);
    });
    it("GRID_ADD على كتلة ليست شبكة لا يغيّر شيئاً", () => {
      expect(blocksReducer(base, { type: "GRID_ADD", key: "a", items: [gi("x")] })[0]).toEqual(base[0]);
    });
    it("GRID_REMOVE يحذف العنصر، وآخر عنصر يحذف الشبكة كلها", () => {
      const s = [grid("g", [gi("1"), gi("2")]), text("t")];
      const r1 = blocksReducer(s, { type: "GRID_REMOVE", key: "g", itemKey: "1" });
      expect((r1[0] as Extract<Block, { type: "grid" }>).items.map((i) => i._key)).toEqual(["2"]);
      const r2 = blocksReducer(r1, { type: "GRID_REMOVE", key: "g", itemKey: "2" });
      expect(keys(r2)).toBe("t");
    });
    it("GRID_COLUMNS يقصّ بين 1 و4 ويقرّب", () => {
      const s = [grid("g", [gi("1")], 2)];
      const col = (n: number) => (blocksReducer(s, { type: "GRID_COLUMNS", key: "g", columns: n })[0] as Extract<Block, { type: "grid" }>).columns;
      expect(col(0)).toBe(1);
      expect(col(9)).toBe(4);
      expect(col(2.6)).toBe(3);
      expect(col(3)).toBe(3);
    });
  });

  it("إجراء مجهول يعيد الحالة كما هي", () => {
    // @ts-expect-error نوع إجراء غير موجود عمداً
    expect(blocksReducer(base, { type: "NOPE" })).toBe(base);
  });
});
