# الاختبارات

أداة التشغيل: [Vitest](https://vitest.dev). لا تحتاج حساباً أو شبكة، ولا تلمس Sanity أو Cloudinary أو البريد الحقيقي (كلها تُحاكى).

## التثبيت (مرة واحدة)

```bash
pnpm add -D vitest
```

الأمر يحدّث `package.json` و`pnpm-lock.yaml` معاً. لا تعدّل `package.json` يدوياً؛ وإلا فسيفشل `pnpm install --frozen-lockfile` على Vercel أو CI.

> إن ظهر تحذير `Ignored build scripts: esbuild` فهو غير مؤثر على vitest. وإن أردت إسكاته: `pnpm approve-builds`.

## التشغيل

```bash
pnpm exec vitest run            # تشغيل كل الاختبارات مرة واحدة
pnpm exec vitest                # وضع المراقبة أثناء التطوير
pnpm exec vitest run tests/api  # مجلد واحد
pnpm exec vitest run -t "login" # الاختبارات التي يحتوي اسمها "login"
```

اختيارياً أضف في `package.json` ضمن `scripts`: `"test": "vitest run"` ثم شغّل `pnpm test`.

## البنية

- `tests/unit/` دوال نقية وReducers وتحقق المدخلات والتنظيف.
- `tests/api/` مسارات الـ API والـ middleware مع محاكاة Sanity وnodemailer.
- `tests/helpers.ts` أدوات مشتركة (طلبات، كوكي مدير، عناوين IP فريدة).
- القيم الوهمية للبيئة في `vitest.config.ts` (لا تضع أسراراً حقيقية فيه).
- `tests/` و`vitest.config.ts` مستثنيان من `tsconfig.json` الرئيسي حتى لا يؤثر أي خطأ أنواع في الاختبارات على `next build`؛ والمحرر يقرأ `tests/tsconfig.json`.
