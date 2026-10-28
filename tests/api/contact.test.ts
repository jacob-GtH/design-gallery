import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: h.createTransport } }));

import { POST } from "@/app/api/contact/route";
import { freshIp, makeReq } from "../helpers";

const URL_ = "http://localhost/api/contact";
const valid = (over: Record<string, unknown> = {}) => ({
  name: "Ali",
  email: "ali@example.com",
  message: "Hello there, this is a test message",
  ...over,
});
const send = (body: unknown, opts: { ip?: string; headers?: Record<string, string>; raw?: string } = {}) =>
  makeReq(URL_, "POST", { body: opts.raw ? undefined : body, raw: opts.raw, ip: opts.ip, headers: opts.headers }).then(POST);
const mail = () => h.sendMail.mock.calls[0][0];

async function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

beforeEach(() => {
  h.sendMail.mockResolvedValue({});
  h.createTransport.mockReturnValue({ sendMail: h.sendMail });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/contact", () => {
  it("نجاح: يرسل رسالة واحدة بالحقول الصحيحة", async () => {
    const res = await send(valid());
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(h.sendMail).toHaveBeenCalledTimes(1);
    expect(mail()).toMatchObject({
      replyTo: "ali@example.com",
      to: "owner@example.com",
      from: { name: "Ali", address: "no-reply@example.com" },
    });
    expect(mail().subject).toContain("Ali");
    expect(mail().subject).toContain("Test Site");
    expect(mail().text).toContain("Hello there");
  });

  it("المرسل دائماً عنوانك أنت لا بريد الزائر (منع الانتحال)", async () => {
    await send(valid({ email: "ceo@bank.com" }));
    expect(mail().from.address).toBe("no-reply@example.com");
    expect(mail().from.address).not.toBe("ceo@bank.com");
  });

  it("يهرّب HTML في الاسم والبريد والرسالة ويحوّل الأسطر إلى <br>", async () => {
    await send(valid({ name: "<b>x</b>", message: "<script>alert(1)</script>\nsecond line here" }));
    const html: string = mail().html;
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("&lt;/script&gt;<br>second line here");
  });

  it("honeypot: نجاح وهمي دون إرسال", async () => {
    const res = await send(valid({ website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(h.sendMail).not.toHaveBeenCalled();
  });

  it("بيانات غير صالحة: 400 ولا إرسال", async () => {
    for (const bad of [valid({ email: "nope" }), valid({ name: "A" }), valid({ message: "short" }), valid({ name: "Ali\nBcc: x@y.com" }), {}]) {
      expect((await send(bad)).status).toBe(400);
    }
    expect((await send(null, { raw: "not json" })).status).toBe(400);
    expect(h.sendMail).not.toHaveBeenCalled();
  });

  it("الحجم: 413 سواء صرّحت الترويسة أم لا", async () => {
    const big = JSON.stringify(valid({ message: "a".repeat(25_000) }));
    expect((await send(null, { raw: big })).status).toBe(413);
    expect((await send(valid(), { headers: { "content-length": "99999" } })).status).toBe(413);
    expect(h.sendMail).not.toHaveBeenCalled();
  });

  it("الحد: 5 رسائل في الساعة لكل عنوان", async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) expect((await send(valid(), { ip })).status).toBe(200);
    const blocked = await send(valid(), { ip });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect(h.sendMail).toHaveBeenCalledTimes(5);
  });

  it("إعدادات ناقصة: 500 دون كشف السبب", async () => {
    await withEnv({ EMAIL_TO: undefined }, async () => {
      const res = await send(valid());
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("EMAIL_TO");
    });
    await withEnv({ EMAIL_FROM: undefined, EMAIL_USER: undefined }, async () => {
      expect((await send(valid())).status).toBe(500);
    });
  });

  it("EMAIL_FROM غائب: يستخدم EMAIL_USER", async () => {
    await withEnv({ EMAIL_FROM: undefined, EMAIL_USER: "user@mail.com" }, async () => {
      expect((await send(valid())).status).toBe(200);
      expect(mail().from.address).toBe("user@mail.com");
    });
  });

  it("فشل الإرسال: 500 عام دون تسريب", async () => {
    h.sendMail.mockRejectedValue(new Error("SMTP password invalid for user@host"));
    const res = await send(valid());
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("SMTP");
  });

  it("لا يُعطَّل التحقق من شهادة TLS", async () => {
    await send(valid());
    const opts = h.createTransport.mock.calls[0][0];
    expect(JSON.stringify(opts)).not.toContain("rejectUnauthorized");
  });
});
