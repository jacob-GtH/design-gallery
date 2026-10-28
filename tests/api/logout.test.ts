import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/admin/logout/route";
import { SESSION_COOKIE } from "@/lib/auth";

describe("POST /api/admin/logout", () => {
  it("يمسح كوكي الجلسة", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe("");
    const raw = res.headers.get("set-cookie")!.toLowerCase();
    expect(raw).toContain("max-age=0");
    expect(raw).toContain("httponly");
  });
});
