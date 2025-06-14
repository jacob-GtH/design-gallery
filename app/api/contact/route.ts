// app/api/contact/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { validateInput } from '@/sanity/lib/validation'

export async function POST(req: Request) {
    // التحقق من نوع الطلب
    if (req.method !== 'POST') {
        return NextResponse.json(
            { error: 'الطريقة غير مسموح بها' },
            { status: 405 }
        )
    }

    try {
        // التحقق من صحة البيانات
        const body = await req.json()
        const { name, email, message } = body

        const validationError = validateInput({ name, email, message })
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            )
        }

        // تكوين ناقل البريد (Transporter)
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // فقط للتطوير، إزالة في الإنتاج
            }
        })

        // خيارات البريد
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_FROM || email}>`,
            replyTo: email,
            to: process.env.EMAIL_TO,
            subject: `رسالة جديدة من ${name} - ${process.env.SITE_NAME}`,
            text: message,
            html: `
        <div dir="rtl">
          <h2>رسالة جديدة من النموذج الاتصال</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `
        }

        // إرسال البريد
        await transporter.sendMail(mailOptions)

        return NextResponse.json(
            { success: true, message: 'تم إرسال الرسالة بنجاح' },
            { status: 200 }
        )

    } catch (error) {
        console.error('خطأ في إرسال البريد:', error)
        return NextResponse.json(
            { error: 'حدث خطأ أثناء محاولة إرسال الرسالة' },
            { status: 500 }
        )
    }
}