import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/upload-signature/route";
import { ALLOWED_FORMATS, UPLOAD_FOLDER, signParams } from "@/lib/cloudinary";
import { freshIp, makeReq } from "../helpers";

const URL_ = "http://localhost/api/admin/upload-signature";
const sign = (type: unknown, opts: { admin?: boolean; ip?: string } = {}) =>
  makeReq(URL_, "POST", { body: { type }, admin: opts.admin ?? true, ip: opts.ip });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("POST /api/admin/upload-signature", () => {
  it("بدون جلسة: 401 ولا يُكشف شيء", async () => {
    const res = await POST(await sign("image", { admin: false }));
    expect(res.status).toBe(401);
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("secret456");
    expect(text).not.toContain("signature");
  });

  it("نوع غير صالح أو جسم تالف: 400", async () => {
    expect((await POST(await sign("pdf"))).status).toBe(400);
    expect((await POST(await sign(undefined))).status).toBe(400);
    expect((await POST(await makeReq(URL_, "POST", { raw: "nope", admin: true }))).status).toBe(400);
  });

  it("صورة: توقيع صحيح بالمعاملات المقيّدة", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_800_000_000_000);
    const res = await POST(await sign("image"));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toMatchObject({
      cloudName: "mycloud",
      apiKey: "key123",
      timestamp: 1_800_000_000,
      folder: UPLOAD_FOLDER,
      allowedFormats: ALLOWED_FORMATS.image,
    });
    expect(body.signature).toBe(
      signParams({ timestamp: 1_800_000_000, folder: UPLOAD_FOLDER, allowed_formats: ALLOWED_FORMATS.image }, "secret456")
    );
  });

  it("فيديو: صيغ الفيديو فقط", async () => {
    const body = await (await POST(await sign("video"))).json();
    expect(body.allowedFormats).toBe(ALLOWED_FORMATS.video);
    expect(body.allowedFormats).toContain("mp4");
  });

  it("لا يسرّب السر أبداً", async () => {
    const res = await POST(await sign("image"));
    expect(JSON.stringify(await res.json())).not.toContain("secret456");
  });

  it("إعدادات Cloudinary ناقصة: 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const prev = process.env.CLOUDINARY_API_SECRET;
    delete process.env.CLOUDINARY_API_SECRET;
    try {
      const res = await POST(await sign("image"));
      expect(res.status).toBe(500);
    } finally {
      process.env.CLOUDINARY_API_SECRET = prev;
    }
  });

  it("الحد: 200 طلب في الساعة لكل عنوان", async () => {
    const ip = freshIp();
    for (let i = 0; i < 200; i++) expect((await POST(await sign("image", { ip }))).status).toBe(200);
    const blocked = await POST(await sign("image", { ip }));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });
});
