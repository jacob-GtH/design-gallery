import { describe, expect, it } from "vitest";
import { formReducer } from "@/hooks/formAction";
import type { FormState } from "@/components/admin/Types";

const state: FormState = {
  title: "",
  description: "",
  designerId: "",
  tags: ["x", "y", "z"],
  backgroundColor: "#fff",
  coverKey: "",
  designers: [],
  currentTagInput: "",
  error: "",
  loading: false,
};

describe("formReducer", () => {
  it("SET_FIELD", () => {
    expect(formReducer(state, { type: "SET_FIELD", field: "title", value: "T" }).title).toBe("T");
  });
  it("LOAD_INITIAL يدمج دون مسح الباقي", () => {
    const r = formReducer(state, { type: "LOAD_INITIAL", data: { title: "Loaded", coverKey: "k" } });
    expect(r).toMatchObject({ title: "Loaded", coverKey: "k", backgroundColor: "#fff" });
  });
  it("ADD_TAG / REMOVE_TAG دون تعديل الأصل", () => {
    expect(formReducer(state, { type: "ADD_TAG", tag: "w" }).tags).toEqual(["x", "y", "z", "w"]);
    expect(formReducer(state, { type: "REMOVE_TAG", index: 1 }).tags).toEqual(["x", "z"]);
    expect(formReducer(state, { type: "REMOVE_TAG", index: 9 }).tags).toEqual(["x", "y", "z"]);
    expect(state.tags).toEqual(["x", "y", "z"]);
  });
  it("SET_LOADING / SET_DESIGNERS / SET_ERROR", () => {
    expect(formReducer(state, { type: "SET_LOADING", loading: true }).loading).toBe(true);
    expect(formReducer(state, { type: "SET_DESIGNERS", designers: [{ _id: "1", name: "A" }] }).designers).toHaveLength(1);
    expect(formReducer(state, { type: "SET_ERROR", message: "boom" }).error).toBe("boom");
  });
  it("إجراء مجهول يعيد الحالة كما هي", () => {
    // @ts-expect-error نوع إجراء غير موجود عمداً
    expect(formReducer(state, { type: "NOPE" })).toBe(state);
  });
});
