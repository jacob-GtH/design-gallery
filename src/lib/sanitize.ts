// src/lib/sanitize.ts
// تنظيف HTML الخاص بالـ captions (ناتج محرر TipTap، مع دعم بيانات Quill القديمة) قبل الحفظ وقبل العرض.
// يعتمد على القائمة البيضاء: كل وسم/خاصية غير مذكورة تُحذف.
import sanitizeHtml from "sanitize-html";

const COLOR_VALUE = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i,
];

const COLOR_OR_INHERIT = [...COLOR_VALUE, /^inherit$/];

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "strike", "mark",
    "blockquote", "ul", "ol", "li", "a", "span", "pre", "code",
    "h1", "h2", "h3", "h4", "h5", "h6",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    mark: ["data-color", "style"], // التمييز الملوّن في TipTap
    "*": ["class", "style", "dir"],
  },
  // المحرر الحالي TipTap (language-* لكتل الكود)، مع إبقاء أصناف Quill للبيانات القديمة
  allowedClasses: { "*": ["ql-*"], code: ["language-*"] },
  allowedStyles: {
    span: { color: COLOR_VALUE },
    mark: { "background-color": COLOR_VALUE, color: COLOR_OR_INHERIT },
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    }),
  },
};

export function sanitizeCaption(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, options);
}
