// components/editor/extensions.ts
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/react";
import type { Extensions } from "@tiptap/react";

/**
 * اتجاه الفقرة (rtl/ltr) كخاصية على الفقرات والعناوين.
 * بدونها يُحدَّد الاتجاه تلقائياً من أول حرف في الفقرة (انظر .rich-content في globals.css).
 */
const TextDirection = Extension.create({
  name: "textDirection",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          dir: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const d = element.getAttribute("dir");
              return d === "rtl" || d === "ltr" ? d : null;
            },
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.dir ? { dir: attributes.dir as string } : {},
          },
        },
      },
    ];
  },
});

// StarterKit (v3) يتضمن Link وUnderline
export const editorExtensions: Extensions = [
  StarterKit.configure({
    link: { openOnClick: false, autolink: false },
  }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextDirection,
];
