// components/editor/FormatToolbar.tsx
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useEditorState } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Link2Off,
  RemoveFormatting,
  Highlighter,
  List,
  ListOrdered,
  Palette,
  PilcrowLeft,
  PilcrowRight,
} from "lucide-react";
import { useActiveEditor } from "./EditorContext";
import { FONT_OPTIONS, FONT_SIZES, DEFAULT_FONT_SIZE, matchFont } from "./fonts";
import { normalizeLinkUrl, toHexColor } from "./linkUtils";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

function Btn({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // يمنع سرقة التركيز من المحرر (حتى لا تضيع التحديدات)
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-35 ${
        active ? "bg-white/25 text-white" : "text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px shrink-0 bg-white/15" aria-hidden="true" />;

const selectClass =
  "h-9 shrink-0 cursor-pointer rounded-md bg-transparent px-2 text-sm text-white outline-none hover:bg-white/10 disabled:opacity-35 [&>option]:text-black";

export default function FormatToolbar() {
  const { t } = useTranslation();
  const { activeEditor } = useActiveEditor();
  const editor = activeEditor && !activeEditor.isDestroyed ? activeEditor : null;

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState(false);

  const s = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      const ts = ed.getAttributes("textStyle");
      const blockType: BlockType = ed.isActive("heading", { level: 1 })
        ? "h1"
        : ed.isActive("heading", { level: 2 })
          ? "h2"
          : ed.isActive("heading", { level: 3 })
            ? "h3"
            : ed.isActive("blockquote")
              ? "quote"
              : "paragraph";
      return {
        bold: ed.isActive("bold"),
        italic: ed.isActive("italic"),
        underline: ed.isActive("underline"),
        highlight: ed.isActive("highlight"),
        link: ed.isActive("link"),
        bullet: ed.isActive("bulletList"),
        ordered: ed.isActive("orderedList"),
        alignLeft: ed.isActive({ textAlign: "left" }),
        alignCenter: ed.isActive({ textAlign: "center" }),
        alignRight: ed.isActive({ textAlign: "right" }),
        blockType,
        font: matchFont(ts.fontFamily as string | undefined),
        size: ts.fontSize ? parseInt(String(ts.fontSize), 10) || DEFAULT_FONT_SIZE : DEFAULT_FONT_SIZE,
        color: toHexColor(ts.color as string | undefined),
        dir: ((ed.getAttributes("paragraph").dir ?? ed.getAttributes("heading").dir) as string | undefined) ?? null,
        linkHref: (ed.getAttributes("link").href as string | undefined) ?? "",
      };
    },
  });

  const off = !editor;
  const chain = () => editor?.chain().focus();

  const applyBlockType = (type: BlockType) => {
    if (!editor) return;
    const c = editor.chain().focus();
    if (type !== "quote" && editor.isActive("blockquote")) c.toggleBlockquote();
    if (type === "paragraph") c.setParagraph().run();
    else if (type === "quote") {
      if (!editor.isActive("blockquote")) c.toggleBlockquote();
      c.run();
    } else {
      c.setHeading({ level: Number(type.slice(1)) as 1 | 2 | 3 }).run();
    }
  };

  const applyFont = (value: string) => {
    if (value) chain()?.setFontFamily(value).run();
    else chain()?.unsetFontFamily().run();
  };

  const applySize = (px: number) => {
    if (px === DEFAULT_FONT_SIZE) chain()?.unsetFontSize().run();
    else chain()?.setFontSize(`${px}px`).run();
  };

  const toggleDirection = () => {
    if (!editor) return;
    const next = s?.dir === "rtl" ? "ltr" : "rtl";
    editor
      .chain()
      .focus()
      .updateAttributes("paragraph", { dir: next })
      .updateAttributes("heading", { dir: next })
      .run();
  };

  const clearFormatting = () => {
    chain()
      ?.unsetAllMarks()
      .clearNodes()
      .unsetTextAlign()
      .updateAttributes("paragraph", { dir: null })
      .run();
  };

  const openLink = () => {
    setLinkValue(s?.linkHref ?? "");
    setLinkError(false);
    setLinkOpen(true);
  };

  const applyLink = () => {
    const href = normalizeLinkUrl(linkValue);
    if (!href) {
      setLinkError(true);
      return;
    }
    chain()?.extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
  };

  const sizes = FONT_SIZES.includes(s?.size ?? DEFAULT_FONT_SIZE)
    ? FONT_SIZES
    : [...FONT_SIZES, s?.size ?? DEFAULT_FONT_SIZE].sort((a, b) => a - b);

  return (
    <div className="rounded-xl bg-[#1b1b1f] text-white shadow-lg" role="toolbar" aria-label={t("editor.toolbar")}>
      <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-1.5 [scrollbar-width:thin]">
        <select
          className={`${selectClass} w-[7.5rem]`}
          aria-label={t("editor.blockType")}
          value={s?.blockType ?? "paragraph"}
          disabled={off}
          onChange={(e) => applyBlockType(e.target.value as BlockType)}
        >
          <option value="paragraph">{t("editor.paragraph")}</option>
          <option value="h1">{t("editor.heading1")}</option>
          <option value="h2">{t("editor.heading2")}</option>
          <option value="h3">{t("editor.heading3")}</option>
          <option value="quote">{t("editor.quote")}</option>
        </select>
        <Sep />
        <select
          className={`${selectClass} w-[8.5rem]`}
          aria-label={t("editor.font")}
          value={s?.font ?? ""}
          disabled={off}
          onChange={(e) => applyFont(e.target.value)}
        >
          <option value="">{t("editor.defaultFont")}</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className={`${selectClass} w-[4.25rem]`}
          aria-label={t("editor.size")}
          value={String(s?.size ?? DEFAULT_FONT_SIZE)}
          disabled={off}
          onChange={(e) => applySize(parseInt(e.target.value, 10))}
        >
          {sizes.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Sep />

        <label
          className={`relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/80 hover:bg-white/10 ${off ? "pointer-events-none opacity-35" : ""}`}
          title={t("editor.textColor")}
        >
          <Palette size={18} />
          <span
            className="absolute bottom-1 h-[3px] w-4 rounded"
            style={{ backgroundColor: s?.color || "#ffffff" }}
          />
          <input
            type="color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={t("editor.textColor")}
            value={s?.color || "#000000"}
            disabled={off}
            onChange={(e) => chain()?.setColor(e.target.value).run()}
          />
        </label>
        <Btn label={t("editor.highlight")} active={s?.highlight} disabled={off} onClick={() => chain()?.toggleHighlight().run()}>
          <Highlighter size={18} />
        </Btn>
        <Sep />

        <Btn label={t("editor.bold")} active={s?.bold} disabled={off} onClick={() => chain()?.toggleBold().run()}>
          <Bold size={18} />
        </Btn>
        <Btn label={t("editor.italic")} active={s?.italic} disabled={off} onClick={() => chain()?.toggleItalic().run()}>
          <Italic size={18} />
        </Btn>
        <Btn label={t("editor.underline")} active={s?.underline} disabled={off} onClick={() => chain()?.toggleUnderline().run()}>
          <Underline size={18} />
        </Btn>
        <Sep />

        <Btn label={t("editor.alignLeft")} active={s?.alignLeft} disabled={off} onClick={() => chain()?.setTextAlign("left").run()}>
          <AlignLeft size={18} />
        </Btn>
        <Btn label={t("editor.alignCenter")} active={s?.alignCenter} disabled={off} onClick={() => chain()?.setTextAlign("center").run()}>
          <AlignCenter size={18} />
        </Btn>
        <Btn label={t("editor.alignRight")} active={s?.alignRight} disabled={off} onClick={() => chain()?.setTextAlign("right").run()}>
          <AlignRight size={18} />
        </Btn>
        <Sep />

        <Btn label={t("editor.bulletList")} active={s?.bullet} disabled={off} onClick={() => chain()?.toggleBulletList().run()}>
          <List size={18} />
        </Btn>
        <Btn label={t("editor.orderedList")} active={s?.ordered} disabled={off} onClick={() => chain()?.toggleOrderedList().run()}>
          <ListOrdered size={18} />
        </Btn>
        <Sep />

        <Btn label={t("editor.link")} active={s?.link || linkOpen} disabled={off} onClick={openLink}>
          <LinkIcon size={18} />
        </Btn>
        <Btn
          label={t("editor.unlink")}
          disabled={off || !s?.link}
          onClick={() => chain()?.extendMarkRange("link").unsetLink().run()}
        >
          <Link2Off size={18} />
        </Btn>
        <Sep />

        <Btn label={t("editor.clearFormat")} disabled={off} onClick={clearFormatting}>
          <RemoveFormatting size={18} />
        </Btn>
        <Btn
          label={s?.dir === "rtl" ? t("editor.dirLtr") : t("editor.dirRtl")}
          active={s?.dir === "rtl"}
          disabled={off}
          onClick={toggleDirection}
        >
          {s?.dir === "rtl" ? <PilcrowLeft size={18} /> : <PilcrowRight size={18} />}
        </Btn>

        {off && (
          <span className="ms-3 hidden shrink-0 text-xs text-white/50 md:inline">
            {t("editor.selectTextHint")}
          </span>
        )}
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2">
          <input
            autoFocus
            dir="ltr"
            type="text"
            inputMode="url"
            value={linkValue}
            placeholder="https://example.com"
            aria-label={t("editor.linkUrl")}
            aria-invalid={linkError}
            onChange={(e) => {
              setLinkValue(e.target.value);
              setLinkError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            className={`min-w-[12rem] flex-1 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 ${linkError ? "ring-2 ring-red-400" : "focus:ring-indigo-400"}`}
          />
          <button type="button" onClick={applyLink} className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium hover:bg-indigo-400">
            {t("editor.apply")}
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="rounded-md px-3 py-1.5 text-sm text-white/70 hover:bg-white/10">
            {t("editor.cancel")}
          </button>
          <p className={`w-full text-xs ${linkError ? "text-red-300" : "text-white/50"}`}>
            {linkError ? t("editor.linkInvalid") : t("editor.linkHint")}
          </p>
        </div>
      )}
    </div>
  );
}
