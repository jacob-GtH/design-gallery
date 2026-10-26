// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/validation";
import { escapeHtml } from "@/lib/escapeHtml";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const MAX_BODY_BYTES = 20 * 1024;

export async function POST(req: NextRequest) {
  // 1) حد الطلبات: 5 رسائل في الساعة لكل عنوان
  const rl = rateLimit(`contact:${getClientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول لاحقاً" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  // 2) حجم الطلب
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "الطلب كبير جداً" }, { status: 413 });
  }

  // 3) التحقق من المدخلات
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }
  const { name, email, message, website } = parsed.data;

  // 4) honeypot: نُظهر نجاحاً وهمياً للبوتات دون إرسال شيء
  if (website) {
    return NextResponse.json({ success: true, message: "تم إرسال الرسالة بنجاح" });
  }

  // 5) إعدادات البريد
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const toAddress = process.env.EMAIL_TO;
  if (!fromAddress || !toAddress) {
    console.error("❌ EMAIL_FROM/EMAIL_USER أو EMAIL_TO غير مضبوطين");
    return NextResponse.json({ error: "الخادم غير مهيأ" }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ملاحظة: أُزيل tls.rejectUnauthorized=false؛ التحقق من الشهادة مفعّل الآن.
    });

    const siteName = process.env.SITE_NAME || "Design Gallery";
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

    await transporter.sendMail({
      // المرسل دائماً عنوانك أنت؛ اسم الزائر يظهر كاسم عرض فقط
      from: { name, address: fromAddress },
      replyTo: email,
      to: toAddress,
      subject: `رسالة جديدة من ${name} - ${siteName}`,
      text: `الاسم: ${name}\nالبريد: ${email}\n\n${message}`,
      html: `
        <div dir="rtl">
          <h2>رسالة جديدة من نموذج الاتصال</h2>
          <p><strong>الاسم:</strong> ${safeName}</p>
          <p><strong>البريد الإلكتروني:</strong> ${safeEmail}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "تم إرسال الرسالة بنجاح" });
  } catch (error) {
    console.error("خطأ في إرسال البريد:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الرسالة" },
      { status: 500 }
    );
  }
}
