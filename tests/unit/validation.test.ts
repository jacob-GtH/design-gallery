import { describe, expect, it } from "vitest";
import { contactSchema, validateInput } from "@/lib/validation";

const ok = { name: "Ali", email: "ali@example.com", message: "رسالة صحيحة وطويلة كفاية" };

describe("contactSchema", () => {
  it("يقبل بيانات صحيحة ويضيف website فارغاً افتراضياً", () => {
    const r = contactSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.website).toBe("");
  });

  it("يقصّ المسافات", () => {
    const r = contactSchema.parse({ ...ok, name: "  Ali  ", email: " ali@example.com ", message: "  " + ok.message + "  " });
    expect(r.name).toBe("Ali");
    expect(r.email).toBe("ali@example.com");
    expect(r.message).toBe(ok.message);
  });

  describe("الاسم", () => {
    it("الحد الأدنى حرفان بالضبط (بعد القص)", () => {
      expect(contactSchema.safeParse({ ...ok, name: "A" }).success).toBe(false);
      expect(contactSchema.safeParse({ ...ok, name: "Al" }).success).toBe(true);
      expect(contactSchema.safeParse({ ...ok, name: "  A  " }).success).toBe(false);
    });
    it("الحد الأقصى 100", () => {
      expect(contactSchema.safeParse({ ...ok, name: "a".repeat(100) }).success).toBe(true);
      expect(contactSchema.safeParse({ ...ok, name: "a".repeat(101) }).success).toBe(false);
    });
    it("يرفض الأسطر الجديدة (حقن ترويسات البريد)", () => {
      expect(contactSchema.safeParse({ ...ok, name: "Ali\nBcc: evil@x.com" }).success).toBe(false);
      expect(contactSchema.safeParse({ ...ok, name: "Ali\rBcc: evil@x.com" }).success).toBe(false);
    });
  });

  describe("البريد", () => {
    it.each([["plain"], ["a@b"], ["@b.com"], ["a b@c.com"], [""]])("يرفض %j", (email) => {
      expect(contactSchema.safeParse({ ...ok, email }).success).toBe(false);
    });
    it("يرفض الأطول من 254", () => {
      expect(contactSchema.safeParse({ ...ok, email: "a".repeat(250) + "@x.com" }).success).toBe(false);
    });
  });

  describe("الرسالة", () => {
    it("الحد الأدنى 10 بالضبط", () => {
      expect(contactSchema.safeParse({ ...ok, message: "123456789" }).success).toBe(false);
      expect(contactSchema.safeParse({ ...ok, message: "1234567890" }).success).toBe(true);
    });
    it("الحد الأقصى 5000", () => {
      expect(contactSchema.safeParse({ ...ok, message: "a".repeat(5000) }).success).toBe(true);
      expect(contactSchema.safeParse({ ...ok, message: "a".repeat(5001) }).success).toBe(false);
    });
  });

  it("honeypot: حقل website حده 200", () => {
    expect(contactSchema.safeParse({ ...ok, website: "x".repeat(200) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...ok, website: "x".repeat(201) }).success).toBe(false);
  });

  it("يرفض الحقول الغائبة وأنواع القيم الخاطئة", () => {
    expect(contactSchema.safeParse({}).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, name: 5 }).success).toBe(false);
    expect(contactSchema.safeParse(null).success).toBe(false);
  });
});

describe("validateInput (واجهة قديمة)", () => {
  it("يرجع null للبيانات الصحيحة", () => {
    expect(validateInput(ok)).toBeNull();
  });
  it("يرجع رسالة نصية غير فارغة عند الخطأ", () => {
    for (const bad of [{ ...ok, name: "A" }, { ...ok, email: "x" }, { ...ok, message: "short" }]) {
      const msg = validateInput(bad);
      expect(typeof msg).toBe("string");
      expect((msg as string).length).toBeGreaterThan(0);
    }
  });
});
