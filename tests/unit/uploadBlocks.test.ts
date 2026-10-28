import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadBlocks } from "@/hooks/useMediaUpload";
import type { Block } from "@/components/admin/Types";

type Reply = {
  status: number;
  body: string;
  progress?: { loaded: number; total: number; lengthComputable: boolean };
};

class FakeXHR {
  static reply: Reply = { status: 200, body: "{}" };
  static instances: FakeXHR[] = [];
  upload = {
    handlers: [] as Array<(e: unknown) => void>,
    addEventListener(_t: string, f: (e: unknown) => void) {
      this.handlers.push(f);
    },
  };
  status = 0;
  statusText = "";
  responseText = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  url = "";
  sent: FormData | null = null;
  open(_m: string, url: string) {
    this.url = url;
    FakeXHR.instances.push(this);
  }
  send(data: FormData) {
    this.sent = data;
    queueMicrotask(() => {
      const r = FakeXHR.reply;
      if (r.progress) this.upload.handlers.forEach((h) => h(r.progress));
      this.status = r.status;
      this.responseText = r.body;
      this.onload?.();
    });
  }
}

const SIG = { cloudName: "mycloud", apiKey: "key123", timestamp: 1700000000, signature: "sig", folder: "design-gallery", allowedFormats: "jpg,png" };
const sigOk = () => ({ ok: true, status: 200, json: async () => SIG });
const okBody = (n: number) => JSON.stringify({ secure_url: `https://res.cloudinary.com/mycloud/image/upload/${n}.png` });

const png = () => new File(["x"], "a.png", { type: "image/png" });
const imageBlock = (extra: Record<string, unknown> = {}): Block =>
  ({ type: "image", _key: "k1", file: png(), previewUrl: "", caption: "cap", ...extra }) as Block;

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn(async () => sigOk());
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
  FakeXHR.instances = [];
  FakeXHR.reply = { status: 200, body: okBody(1) };
});
afterEach(() => vi.unstubAllGlobals());

describe("uploadBlocks", () => {
  it("يرفع الصورة بتوقيع الخادم ويرجع حمولة الـ API", async () => {
    const dispatch = vi.fn();
    const r = await uploadBlocks([imageBlock()], dispatch);
    expect(r).toEqual([{ _key: "k1", type: "image", url: "https://res.cloudinary.com/mycloud/image/upload/1.png", caption: "cap" }]);
    expect(dispatch).toHaveBeenCalledWith({ type: "UPLOADED", key: "k1", url: "https://res.cloudinary.com/mycloud/image/upload/1.png" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/upload-signature");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ type: "image" });

    const xhr = FakeXHR.instances[0];
    expect(xhr.url).toBe("https://api.cloudinary.com/v1_1/mycloud/image/upload");
    const form = xhr.sent!;
    expect(form.get("api_key")).toBe("key123");
    expect(form.get("signature")).toBe("sig");
    expect(form.get("timestamp")).toBe("1700000000");
    expect(form.get("folder")).toBe("design-gallery");
    expect(form.get("allowed_formats")).toBe("jpg,png");
    expect(form.has("upload_preset")).toBe(false); // لا preset مفتوح
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("الفيديو يُرفع إلى مسار video", async () => {
    await uploadBlocks([imageBlock({ type: "video", file: new File(["x"], "a.mp4", { type: "video/mp4" }) })], vi.fn());
    expect(FakeXHR.instances[0].url).toContain("/video/upload");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ type: "video" });
  });

  it("المرفوع سابقاً لا يُعاد رفعه ولا يُطلب له توقيع", async () => {
    const r = await uploadBlocks([imageBlock({ uploadedUrl: "https://x/y.png", file: null })], vi.fn());
    expect(r[0]).toMatchObject({ url: "https://x/y.png" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("النص والتضمين يمرّان كما هما بلا رفع", async () => {
    const r = await uploadBlocks(
      [
        { type: "text", _key: "t", caption: "<p>a</p>" },
        { type: "embed", _key: "e", url: "https://vimeo.com/123456789", caption: "" },
      ],
      vi.fn()
    );
    expect(r).toEqual([
      { _key: "t", type: "text", caption: "<p>a</p>" },
      { _key: "e", type: "embed", url: "https://vimeo.com/123456789", caption: "" },
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("الشبكة: ترفع كل عنصر كصورة وتحفظ الأعمدة والترتيب", async () => {
    let n = 0;
    FakeXHR.reply = { status: 200, body: okBody(0) };
    const orig = FakeXHR.prototype.send;
    FakeXHR.prototype.send = function (data: FormData) {
      FakeXHR.reply = { status: 200, body: okBody(++n) };
      return orig.call(this, data);
    };
    try {
      const dispatch = vi.fn();
      const grid: Block = {
        type: "grid",
        _key: "g",
        columns: 2,
        caption: "",
        items: [
          { _key: "i1", file: png(), previewUrl: "" },
          { _key: "i2", file: png(), previewUrl: "" },
        ],
      };
      const r = await uploadBlocks([grid], dispatch);
      expect(r[0]).toEqual({
        _key: "g",
        type: "grid",
        columns: 2,
        caption: "",
        items: [
          { _key: "i1", url: "https://res.cloudinary.com/mycloud/image/upload/1.png" },
          { _key: "i2", url: "https://res.cloudinary.com/mycloud/image/upload/2.png" },
        ],
      });
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "UPLOADED", key: "g", itemKey: "i2" }));
      expect(FakeXHR.instances.every((x) => x.url.includes("/image/upload"))).toBe(true);
    } finally {
      FakeXHR.prototype.send = orig;
    }
  });

  it("يحافظ على ترتيب الكتل المختلطة", async () => {
    const r = await uploadBlocks(
      [{ type: "text", _key: "t", caption: "" }, imageBlock(), { type: "embed", _key: "e", url: "https://vimeo.com/123456789", caption: "" }],
      vi.fn()
    );
    expect(r.map((b) => b._key)).toEqual(["t", "k1", "e"]);
  });

  it("كتلة بلا ملف ولا رابط => خطأ واضح", async () => {
    await expect(uploadBlocks([imageBlock({ file: null })], vi.fn())).rejects.toThrow("ملف مفقود");
  });

  it("انتهاء الجلسة (401) برسالة واضحة، وغيره برسالة عامة", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(uploadBlocks([imageBlock()], vi.fn())).rejects.toThrow(/انتهت الجلسة/);
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(uploadBlocks([imageBlock()], vi.fn())).rejects.toThrow(/تعذر الحصول على إذن الرفع/);
  });

  it("يعرض سبب رفض Cloudinary من JSON الاستجابة", async () => {
    FakeXHR.reply = { status: 400, body: JSON.stringify({ error: { message: "Invalid extension in transformation: svg" } }) };
    await expect(uploadBlocks([imageBlock()], vi.fn())).rejects.toThrow(/Invalid extension/);
  });

  it("رفض غير JSON يرجع رمز الحالة", async () => {
    FakeXHR.reply = { status: 502, body: "<html>bad gateway</html>" };
    await expect(uploadBlocks([imageBlock()], vi.fn())).rejects.toThrow(/502/);
  });

  it("استجابة 200 غير JSON تنتهي بخطأ ولا تبقى معلّقة", async () => {
    FakeXHR.reply = { status: 200, body: "<html>oops</html>" };
    await expect(uploadBlocks([imageBlock()], vi.fn())).rejects.toThrow(/استجابة غير صالحة/);
  });

  it("يرسل التقدّم، ويتجاهل غير القابل للحساب (لا NaN)", async () => {
    const dispatch = vi.fn();
    FakeXHR.reply = { status: 200, body: okBody(1), progress: { loaded: 50, total: 100, lengthComputable: true } };
    await uploadBlocks([imageBlock()], dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: "PROGRESS", key: "k1", progress: 50 });

    dispatch.mockClear();
    FakeXHR.reply = { status: 200, body: okBody(1), progress: { loaded: 50, total: 0, lengthComputable: false } };
    await uploadBlocks([imageBlock()], dispatch);
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "PROGRESS" }));
  });
});
