import { describe, expect, it } from "vitest";
import { sanitizeCaption } from "@/lib/sanitize";

const s = sanitizeCaption;

describe("sanitizeCaption", () => {
  it("قيم فارغة => نص فارغ", () => {
    expect(s(null)).toBe("");
    expect(s(undefined)).toBe("");
    expect(s("")).toBe("");
  });

  it("يُبقي التنسيق المسموح كما هو", () => {
    const html = "<p><strong>a</strong> <em>b</em> <u>c</u> <s>d</s></p><ul><li>x</li></ul><ol><li>y</li></ol><blockquote>q</blockquote>";
    expect(s(html)).toBe(html);
  });
  it("العناوين والكود والفاصل", () => {
    for (const t of ["h1", "h2", "h3", "h4", "h5", "h6"]) expect(s(`<${t}>x</${t}>`)).toBe(`<${t}>x</${t}>`);
    expect(s("<pre><code>a</code></pre>")).toBe("<pre><code>a</code></pre>");
    expect(s("<hr>")).toContain("<hr");
  });
  it("النص العربي والاتجاه dir", () => {
    expect(s('<p dir="rtl">مرحبا</p>')).toBe('<p dir="rtl">مرحبا</p>');
  });

  describe("XSS", () => {
    it("يحذف script مع محتواه", () => {
      expect(s("<p>hi</p><script>alert(1)</script>")).toBe("<p>hi</p>");
    });
    it("يحذف الوسوم غير المسموحة", () => {
      for (const t of [
        "<img src=x onerror=alert(1)>",
        '<iframe src="https://evil.com"></iframe>',
        "<svg onload=alert(1)></svg>",
        "<object data=x></object>",
        '<form action="/x"><input></form>',
        "<style>body{display:none}</style>",
        "<video src=x onerror=alert(1)></video>",
      ]) {
        const out = s(t);
        expect(out).not.toMatch(/<(img|iframe|svg|object|form|input|style|video)/i);
        expect(out).not.toMatch(/onerror|onload/i);
      }
    });
    it("يحذف معالجات الأحداث من الوسوم المسموحة", () => {
      expect(s('<p onclick="alert(1)" onmouseover="x()">t</p>')).toBe("<p>t</p>");
    });
    it("يمنع javascript: وdata: وvbscript: في الروابط", () => {
      for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>1</script>", "vbscript:x", " javascript:alert(1)"]) {
        const out = s(`<a href="${href}">x</a>`).toLowerCase();
        expect(out).not.toContain("javascript:");
        expect(out).not.toContain("data:");
        expect(out).not.toContain("vbscript:");
      }
    });
    it("يمنع الروابط النسبية للبروتوكول //evil.com", () => {
      expect(s('<a href="//evil.com">x</a>')).not.toContain("evil.com");
    });
    it("لا يحوّل الكيانات المهرَّبة إلى وسوم", () => {
      expect(s("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>")).toContain("&lt;script&gt;");
    });
    it("التمويه بالحروف الكبيرة أو الوسوم المتداخلة لا يتجاوز التنظيف", () => {
      expect(s("<ScRiPt >alert(1)</sCrIpT>")).toBe("");
      expect(s("<scr<script>ipt>alert(1)</scr</script>ipt>")).not.toMatch(/<script/i);
    });
  });

  describe("الروابط", () => {
    it("https يُبقى مع target وrel آمنين", () => {
      const out = s('<a href="https://example.com/a?b=1">x</a>');
      expect(out).toContain('href="https://example.com/a?b=1"');
      expect(out).toContain('target="_blank"');
      expect(out).toContain('rel="noopener noreferrer nofollow"');
    });
    it("mailto وtel وhttp مسموحة", () => {
      expect(s('<a href="mailto:a@b.com">m</a>')).toContain('href="mailto:a@b.com"');
      expect(s('<a href="tel:+123">t</a>')).toContain('href="tel:+123"');
      expect(s('<a href="http://example.com">h</a>')).toContain('href="http://example.com"');
    });
    it("يفرض rel وtarget حتى لو حاول المحرر تغييرهما", () => {
      const out = s('<a href="https://x.com" rel="opener" target="_self">x</a>');
      expect(out).toContain('rel="noopener noreferrer nofollow"');
      expect(out).toContain('target="_blank"');
      expect(out).not.toContain("_self");
    });
  });

  describe("الأنماط على span", () => {
    it("لون hex/rgb", () => {
      expect(s('<span style="color:#ff0000">x</span>')).toContain("color:#ff0000");
      expect(s('<span style="color: rgb(1, 2, 3)">x</span>')).toContain("rgb(1, 2, 3)");
    });
    it("يمنع الألوان بالاسم والدوال الخطرة", () => {
      expect(s('<span style="color:red">x</span>')).not.toContain("red");
      expect(s('<span style="background:url(javascript:alert(1))">x</span>')).not.toContain("javascript");
      expect(s('<span style="color:expression(alert(1))">x</span>')).not.toContain("expression");
    });
    it("inherit غير مسموح على span", () => {
      expect(s('<span style="color:inherit">x</span>')).not.toContain("inherit");
    });
    it("حجم الخط: px/rem/em فقط وبحدود", () => {
      expect(s('<span style="font-size:24px">x</span>')).toContain("font-size:24px");
      expect(s('<span style="font-size:1.5rem">x</span>')).toContain("font-size:1.5rem");
      expect(s('<span style="font-size:2em">x</span>')).toContain("font-size:2em");
      expect(s('<span style="font-size:24pt">x</span>')).not.toContain("font-size");
      expect(s('<span style="font-size:100vh">x</span>')).not.toContain("font-size");
      expect(s('<span style="font-size:1000px">x</span>')).not.toContain("font-size");
      expect(s('<span style="font-size:calc(1px+1px)">x</span>')).not.toContain("calc");
    });
    it("عائلة الخط: متغيرات الموقع وأسماء بسيطة فقط", () => {
      expect(s('<span style="font-family:var(--font-cairo)">x</span>')).toContain("var(--font-cairo)");
      expect(s('<span style="font-family:Arial, sans-serif">x</span>')).toContain("Arial");
      expect(s('<span style="font-family:url(javascript:alert(1))">x</span>')).not.toContain("font-family");
      expect(s('<span style="font-family:a;position:fixed">x</span>')).not.toContain("position");
    });
  });

  describe("mark (التمييز)", () => {
    it("يُبقي data-color ولون الخلفية hex وlون inherit", () => {
      const out = s('<mark data-color="#ffff00" style="background-color:#ffff00;color:inherit">x</mark>');
      expect(out).toContain('data-color="#ffff00"');
      expect(out).toContain("background-color:#ffff00");
      expect(out).toContain("color:inherit");
    });
    it("يرفض خلفية بغير لون صالح", () => {
      expect(s('<mark style="background-color:url(x)">x</mark>')).not.toContain("url");
    });
  });

  describe("أنماط عامة وأصناف", () => {
    it("text-align على أي وسم بقيم محددة", () => {
      expect(s('<p style="text-align:center">x</p>')).toContain("text-align:center");
      expect(s('<p style="text-align:evil">x</p>')).not.toContain("evil");
    });
    it("خصائص CSS غير المدرجة تُحذف", () => {
      const out = s('<p style="position:fixed;top:0;text-align:left">x</p>');
      expect(out).not.toContain("position");
      expect(out).not.toContain("top:");
    });
    it("أصناف ql-* وlanguage-* على code فقط", () => {
      expect(s('<p class="ql-align-center">x</p>')).toContain('class="ql-align-center"');
      expect(s('<code class="language-js">x</code>')).toContain('class="language-js"');
      expect(s('<p class="language-js">x</p>')).not.toContain("language-js");
      expect(s('<p class="evil">x</p>')).not.toContain("evil");
    });
    it("سمات data-* الأخرى تُحذف", () => {
      expect(s('<p data-x="1">x</p>')).toBe("<p>x</p>");
    });
  });

  it("idempotent: تنظيف الناتج لا يغيّره", () => {
    for (const t of [
      '<p style="text-align:right">مرحبا <a href="https://x.com">رابط</a></p>',
      "<p>a</p><script>x</script><h2>t</h2>",
      '<span style="color:#fff;font-size:20px">x</span><mark data-color="#000" style="background-color:#000">y</mark>',
    ]) {
      const once = s(t);
      expect(s(once)).toBe(once);
    }
  });
});
