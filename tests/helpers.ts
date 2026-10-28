// tests/helpers.ts
import { NextRequest } from "next/server";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth";

let ipCounter = 0;
/** عنوان IP جديد لكل اختبار حتى لا تتداخل عدّادات rate limit. */
export const freshIp = () => `10.1.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;

export async function adminCookie(): Promise<string> {
  const token = await createSessionToken();
  if (!token) throw new Error("AUTH_SECRET is not configured for tests");
  return `${SESSION_COOKIE}=${token}`;
}

type Opts = {
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
  admin?: boolean;
  ip?: string;
};

export async function makeReq(url: string, method: string, opts: Opts = {}): Promise<NextRequest> {
  const headers: Record<string, string> = {
    "x-forwarded-for": opts.ip ?? freshIp(),
    ...(opts.headers ?? {}),
  };
  if (opts.body !== undefined || opts.raw !== undefined) headers["content-type"] = "application/json";
  if (opts.admin) headers["cookie"] = await adminCookie();
  return new NextRequest(url, {
    method,
    headers,
    body: opts.raw ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
}

/** سياق المسارات الديناميكية [id] في Next 15 (params وعد). */
export const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

export const CLOUD_URL = (path = "image/upload/a.jpg") => `https://res.cloudinary.com/mycloud/${path}`;
