import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const chain = { setIfMissing: vi.fn(), inc: vi.fn(), commit: vi.fn() };
  chain.setIfMissing.mockReturnValue(chain);
  chain.inc.mockReturnValue(chain);
  return { chain, fetch: vi.fn(), patch: vi.fn(() => chain) };
});
vi.mock("@/lib/sanity.client", () => ({ client: { fetch: h.fetch, patch: h.patch } }));

import { POST } from "@/app/api/designs/like/route";
import { freshIp, makeReq } from "../helpers";

const URL_ = "http://localhost/api/designs/like";
const like = (id: unknown, ip?: string) => makeReq(URL_, "POST", { body: { id }, ip });

beforeEach(() => {
  h.fetch.mockResolvedValue("design-1");
  h.chain.commit.mockResolvedValue({ likes: 5 });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/designs/like", () => {
  it("عام: لا يحتاج جلسة، ويزيد العداد بمقدار 1", async () => {
    const res = await POST(await like("design-1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ likes: 5 });
    expect(h.patch).toHaveBeenCalledWith("design-1");
    expect(h.chain.setIfMissing).toHaveBeenCalledWith({ likes: 0 });
    expect(h.chain.inc).toHaveBeenCalledWith({ likes: 1 });
  });

  it("يتحقق أن المستند من نوع design (لا يعدّل أنواعاً أخرى)", async () => {
    await POST(await like("design-1"));
    expect(h.fetch.mock.calls[0][0]).toContain('_type == "design"');
    expect(h.fetch.mock.calls[0][1]).toEqual({ id: "design-1" });
  });

  it("مستند غير موجود أو من نوع آخر: 404 دون أي تعديل", async () => {
    h.fetch.mockResolvedValue(null);
    const res = await POST(await like("tag-1"));
    expect(res.status).toBe(404);
    expect(h.patch).not.toHaveBeenCalled();
  });

  it("طلب غير صالح: 400", async () => {
    expect((await POST(await makeReq(URL_, "POST", { raw: "x" }))).status).toBe(400);
    expect((await POST(await like(undefined))).status).toBe(400);
    expect((await POST(await like("a b"))).status).toBe(400);
    expect((await POST(await like("a/b"))).status).toBe(400);
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it("إعجاب واحد لكل تصميم من العنوان نفسه", async () => {
    const ip = freshIp();
    expect((await POST(await like("design-1", ip))).status).toBe(200);
    const again = await POST(await like("design-1", ip));
    expect(again.status).toBe(429);
    expect(Number(again.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  it("تصميم مختلف أو عنوان مختلف يمرّ", async () => {
    const ip = freshIp();
    await POST(await like("design-1", ip));
    expect((await POST(await like("design-2", ip))).status).toBe(200);
    expect((await POST(await like("design-1", freshIp()))).status).toBe(200);
  });

  it("سقف عام: 60 تصميماً في الساعة لكل عنوان", async () => {
    const ip = freshIp();
    for (let i = 0; i < 60; i++) expect((await POST(await like(`d${i}`, ip))).status).toBe(200);
    expect((await POST(await like("d-new", ip))).status).toBe(429);
  });

  it("فشل Sanity: 500 دون تسريب التفاصيل", async () => {
    h.chain.commit.mockRejectedValue(new Error("secret db detail"));
    const res = await POST(await like("design-1"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret db detail");
  });
});
