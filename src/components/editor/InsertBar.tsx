// components/editor/InsertBar.tsx
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Type, LayoutGrid, Video, Clapperboard } from "lucide-react";
import { parseEmbedUrl } from "@/lib/embed";
import { ACCEPT_IMAGE, ACCEPT_VIDEO } from "./blockFactory";

type Props = {
  onFiles: (kind: "image" | "video" | "grid", files: File[]) => void;
  onText: () => void;
  onEmbed: (canonicalUrl: string) => void;
};

function Item({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 active:bg-white/25"
    >
      {children}
    </button>
  );
}

export default function InsertBar({ onFiles, onText, onEmbed }: Props) {
  const { t } = useTranslation();
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLInputElement>(null);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedValue, setEmbedValue] = useState("");
  const [embedError, setEmbedError] = useState(false);

  const pick =
    (kind: "image" | "video" | "grid") => (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from<File>(e.target.files ?? []);
      e.target.value = ""; // للسماح باختيار نفس الملف مجدداً
      if (files.length) onFiles(kind, files);
    };

  const submitEmbed = () => {
    const info = parseEmbedUrl(embedValue);
    if (!info) {
      setEmbedError(true);
      return;
    }
    onEmbed(info.canonicalUrl);
    setEmbedValue("");
    setEmbedOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl bg-[#1b1b1f] text-white shadow-lg">
      <div className="flex items-center justify-center gap-1 overflow-x-auto px-3 py-2">
        <span className="me-2 shrink-0 text-sm font-medium text-white/90">{t("editor.insertMedia")}</span>
        <Item label={t("editor.image")} onClick={() => imageRef.current?.click()}>
          <ImageIcon size={20} />
        </Item>
        <Item label={t("editor.text")} onClick={onText}>
          <Type size={20} />
        </Item>
        <Item label={t("editor.grid")} onClick={() => gridRef.current?.click()}>
          <LayoutGrid size={20} />
        </Item>
        <Item label={t("editor.video")} onClick={() => videoRef.current?.click()}>
          <Video size={20} />
        </Item>
        <Item label={t("editor.embed")} onClick={() => setEmbedOpen((v) => !v)}>
          <Clapperboard size={20} />
        </Item>
      </div>

      {embedOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2">
          <input
            autoFocus
            dir="ltr"
            type="text"
            inputMode="url"
            value={embedValue}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-label={t("editor.embedUrl")}
            aria-invalid={embedError}
            onChange={(e) => {
              setEmbedValue(e.target.value);
              setEmbedError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitEmbed();
              }
              if (e.key === "Escape") setEmbedOpen(false);
            }}
            className={`min-w-[12rem] flex-1 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 ${embedError ? "ring-2 ring-red-400" : "focus:ring-indigo-400"}`}
          />
          <button type="button" onClick={submitEmbed} className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium hover:bg-indigo-400">
            {t("editor.add")}
          </button>
          <p className={`w-full text-xs ${embedError ? "text-red-300" : "text-white/50"}`}>
            {embedError ? t("editor.embedInvalid") : t("editor.embedHint")}
          </p>
        </div>
      )}

      <input ref={imageRef} type="file" accept={ACCEPT_IMAGE} multiple hidden onChange={pick("image")} />
      <input ref={videoRef} type="file" accept={ACCEPT_VIDEO} multiple hidden onChange={pick("video")} />
      <input ref={gridRef} type="file" accept={ACCEPT_IMAGE} multiple hidden onChange={pick("grid")} />
    </div>
  );
}
