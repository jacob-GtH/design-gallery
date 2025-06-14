// lib/validation.ts
export function validateInput(data: {
    name: string
    email: string
    message: string
}): string | null {
    if (!data.name || data.name.trim().length < 2) {
        return 'الاسم يجب أن يكون أكثر من حرفين'
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return 'البريد الإلكتروني غير صالح'
    }

    if (!data.message || data.message.trim().length < 10) {
        return 'الرسالة يجب أن تكون أكثر من 10 أحرف'
    }

    return null
}