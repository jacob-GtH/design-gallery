// components/editor/BlocksEditor.tsx
"use client";

import { useRef, useState } from "react";
import type { Dispatch, DragEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, Trash2, Star, Plus, ImagePlus, UploadCloud, X } from "lucide-react";
import type { Block } from "@/components/admin/Types";
import type { BlockAction } from "@/hooks/blocksReducer";
import { MAX_GRID_ITEMS } from "@/hooks/blocksReducer";
import { parseEmbedUrl } from "@/lib/embed";
import { GRID_COLS } from "@/components/designs/gridClasses";
import RichText from "./RichText";
import InsertBar from "./InsertBar";
import {
  ACCEPT_IMAGE,
  MAX_FILE_BYTES,
  makeEmbedBlock,
  makeGridBlock,
  makeGridItems,
  makeMediaBlock,
  makeTextBlock,
  validateFiles,
} from "./blockFactory";
import type { FileKind } from "./blockFactory";

type Props = {
  blocks: Block[];
  dispatch: Dispatch<BlockAction>;
  readOnly: boolean;
  /** مفتاح كتلة الغلاف الفعلية (المختارة أو الأولى المرئية) */
  coverKey: string | null;
  onSetCover: (key: string) => void;
  /** يتغير عند إعادة تحميل/تصفير النموذج ليعاد بناء المحررات */
  version: number;
  onError: (message: string) => void;
};

const isVisual = (b: Block) => b.type === "image" || b.type === "video" || b.type === "grid";

function Progress({ value }: { value: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}

function CtrlBtn({
  label,
  onClick,
  disabled = false,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors disabled:opacity-30 ${
        active ? "bg-amber-400 text-black" : "bg-black/65 text-white hover:bg-black/85"
      }`}
    >
      {children}
    </button>
  );
}

/** وصف الصورة/الفيديو/الشبكة: يظهر زر "إضافة وصف" إن كان فارغاً */
function Caption({
  block,
  readOnly,
  version,
  dispatch,
}: {
  block: Block;
  readOnly: boolean;
  version: number;
  dispatch: Dispatch<BlockAction>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(block.caption !== "");
  const [focusIt, setFocusIt] = useState(false);

  if (readOnly) {
    return block.caption ? (
      <RichText key={`${block._key}-${version}-ro`} value={block.caption} readOnly className="px-2 py-2" />
    ) : null;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setFocusIt(true);
        }}
        className="mt-1 flex items-center gap-1 px-2 py-1 text-sm opacity-60 transition-opacity hover:opacity-100"
      >
        <Plus size={14} />
        {t("editor.addCaption")}
      </button>
    );
  }
  return (
    <RichText
      key={`${block._key}-${version}`}
      value={block.caption}
      placeholder={t("editor.captionPlaceholder")}
      autoFocus={focusIt}
      onChange={(html) => dispatch({ type: "CAPTION", key: block._key, caption: html })}
      className="px-2 py-2"
    />
  );
}

function GridView({
  block,
  readOnly,
  dispatch,
  onFiles,
}: {
  block: Extract<Block, { type: "grid" }>;
  readOnly: boolean;
  dispatch: Dispatch<BlockAction>;
  onFiles: (files: File[]) => void;
}) {
  const { t } = useTranslation();
  const addRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className={`grid ${GRID_COLS[block.columns] ?? GRID_COLS[2]} gap-2`}>
        {block.items.map((it) => (
          <div key={it._key} className="group/item relative aspect-square overflow-hidden bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.previewUrl} alt="" className="h-full w-full object-cover" />
            {!readOnly && (
              <button
                type="button"
                aria-label={t("editor.removeBlock")}
                title={t("editor.removeBlock")}
                onClick={() => dispatch({ type: "GRID_REMOVE", key: block._key, itemKey: it._key })}
                className="absolute end-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-100 md:opacity-0 md:group-hover/item:opacity-100"
              >
                <X size={14} />
              </button>
            )}
            {it.uploadProgress !== undefined && <Progress value={it.uploadProgress} />}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-sm">
          <span className="opacity-70">{t("editor.columns")}</span>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={block.columns === n}
              onClick={() => dispatch({ type: "GRID_COLUMNS", key: block._key, columns: n })}
              className={`h-8 w-8 rounded-md border text-sm ${
                block.columns === n ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-400/50 hover:bg-black/5"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={block.items.length >= MAX_GRID_ITEMS}
            onClick={() => addRef.current?.click()}
            className="ms-auto flex items-center gap-1 rounded-md border border-gray-400/50 px-3 py-1.5 hover:bg-black/5 disabled:opacity-40"
          >
            <ImagePlus size={16} />
            {t("editor.addImages")}
          </button>
          <input
            ref={addRef}
            type="file"
            accept={ACCEPT_IMAGE}
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from<File>(e.target.files ?? []);
              e.target.value = "";
              if (files.length) onFiles(files);
            }}
          />
        </div>
      )}
    </div>
  );
}

function InsertSlot({
  open,
  onToggle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-label={t("editor.insertHere")}
        title={t("editor.insertHere")}
        className="group/slot relative flex h-7 w-full items-center justify-center"
      >
        <span className="absolute inset-x-0 top-1/2 h-px bg-indigo-500/0 transition-colors group-hover/slot:bg-indigo-500/40" />
        <span
          className={`relative flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white transition-opacity ${
            open ? "opacity-100" : "opacity-40 md:opacity-0 group-hover/slot:opacity-100"
          }`}
        >
          <Plus size={14} className={open ? "rotate-45" : ""} />
        </span>
      </button>
      {open && <div className="mb-2 mt-1 w-full">{children}</div>}
    </div>
  );
}

export default function BlocksEditor({
  blocks,
  dispatch,
  readOnly,
  coverKey,
  onSetCover,
  version,
  onError,
}: Props) {
  const { t } = useTranslation();
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const reportRejected = (rejected: { file: File; reason: "size" | "type" }[]) => {
    for (const r of rejected) {
      onError(
        r.reason === "size"
          ? t("editor.errFileSize", { name: r.file.name, mb: MAX_FILE_BYTES / 1024 / 1024 })
          : t("editor.errFileType", { name: r.file.name })
      );
    }
  };

  const addFiles = (kind: FileKind | "grid", files: File[], at: number) => {
    const { valid, rejected } = validateFiles(files, kind === "grid" ? "image" : kind);
    reportRejected(rejected);
    if (!valid.length) return;
    const created = kind === "grid" ? [makeGridBlock(valid)] : valid.map(makeMediaBlock);
    dispatch({ type: "INSERT", blocks: created, at });
    setOpenSlot(null);
  };

  const addText = (at: number) => {
    const b = makeTextBlock();
    setFocusKey(b._key);
    dispatch({ type: "INSERT", blocks: [b], at });
    setOpenSlot(null);
  };

  const addEmbed = (url: string, at: number) => {
    dispatch({ type: "INSERT", blocks: [makeEmbedBlock(url)], at });
    setOpenSlot(null);
  };

  const addToGrid = (key: string, files: File[]) => {
    const { valid, rejected } = validateFiles(files, "image");
    reportRejected(rejected);
    if (valid.length) dispatch({ type: "GRID_ADD", key, items: makeGridItems(valid) });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) addFiles("any", files, blocks.length);
  };

  const renderBar = (at: number) => (
    <InsertBar
      onFiles={(kind, files) => addFiles(kind, files, at)}
      onText={() => addText(at)}
      onEmbed={(url) => addEmbed(url, at)}
    />
  );

  const renderBody = (b: Block): ReactNode => {
    switch (b.type) {
      case "image":
        return (
          <>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.previewUrl} alt="" className="h-auto w-full" />
              {b.uploadProgress !== undefined && <Progress value={b.uploadProgress} />}
            </div>
            <Caption block={b} readOnly={readOnly} version={version} dispatch={dispatch} />
          </>
        );
      case "video":
        return (
          <>
            <div className="relative">
              <video src={b.previewUrl} controls muted loop playsInline className="h-auto w-full" />
              {b.uploadProgress !== undefined && <Progress value={b.uploadProgress} />}
            </div>
            <Caption block={b} readOnly={readOnly} version={version} dispatch={dispatch} />
          </>
        );
      case "text":
        return (
          <RichText
            key={`${b._key}-${version}`}
            value={b.caption}
            readOnly={readOnly}
            placeholder={t("editor.textPlaceholder")}
            autoFocus={focusKey === b._key}
            onChange={(html) => dispatch({ type: "CAPTION", key: b._key, caption: html })}
            className="px-2 py-3"
          />
        );
      case "embed": {
        const info = parseEmbedUrl(b.url);
        return (
          <>
            {info ? (
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <iframe
                  src={info.embedUrl}
                  title={info.provider}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : (
              <p className="p-4 text-sm text-red-500">{t("editor.embedInvalid")}</p>
            )}
            <Caption block={b} readOnly={readOnly} version={version} dispatch={dispatch} />
          </>
        );
      }
      case "grid":
        return (
          <>
            <GridView
              block={b}
              readOnly={readOnly}
              dispatch={dispatch}
              onFiles={(files) => addToGrid(b._key, files)}
            />
            <Caption block={b} readOnly={readOnly} version={version} dispatch={dispatch} />
          </>
        );
    }
  };

  return (
    <div
      onDragOver={(e) => {
        if (readOnly || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-xl transition-shadow ${dragging ? "ring-2 ring-indigo-500 ring-offset-4" : ""}`}
    >
      {blocks.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-400/50 p-8 text-center opacity-80 sm:p-12">
          <UploadCloud size={40} />
          <p className="font-medium">{readOnly ? t("editor.noContent") : t("admin.dragDrop")}</p>
          {!readOnly && <p className="text-xs opacity-70">{t("admin.supportedFormats")}</p>}
        </div>
      )}

      {!readOnly && blocks.length > 0 && (
        <InsertSlot open={openSlot === 0} onToggle={() => setOpenSlot(openSlot === 0 ? null : 0)}>
          {renderBar(0)}
        </InsertSlot>
      )}

      {blocks.map((b, i) => {
        const isCover = coverKey === b._key;
        return (
          <div key={b._key}>
            <section className="group relative my-1 rounded-lg ring-1 ring-transparent transition focus-within:ring-indigo-400/60 hover:ring-black/10">
              {!readOnly && (
                <div className="absolute end-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity group-focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  {isVisual(b) && (
                    <CtrlBtn label={t("editor.setCover")} active={isCover} onClick={() => onSetCover(b._key)}>
                      <Star size={15} fill={isCover ? "currentColor" : "none"} />
                    </CtrlBtn>
                  )}
                  <CtrlBtn label={t("editor.moveUp")} disabled={i === 0} onClick={() => dispatch({ type: "MOVE", key: b._key, dir: -1 })}>
                    <ArrowUp size={15} />
                  </CtrlBtn>
                  <CtrlBtn label={t("editor.moveDown")} disabled={i === blocks.length - 1} onClick={() => dispatch({ type: "MOVE", key: b._key, dir: 1 })}>
                    <ArrowDown size={15} />
                  </CtrlBtn>
                  <CtrlBtn label={t("editor.removeBlock")} onClick={() => dispatch({ type: "REMOVE", key: b._key })}>
                    <Trash2 size={15} />
                  </CtrlBtn>
                </div>
              )}
              {isCover && (
                <span className="absolute start-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-black shadow">
                  <Star size={12} fill="currentColor" />
                  {t("editor.cover")}
                </span>
              )}
              {renderBody(b)}
            </section>
            {!readOnly && (
              <InsertSlot
                open={openSlot === i + 1}
                onToggle={() => setOpenSlot(openSlot === i + 1 ? null : i + 1)}
              >
                {renderBar(i + 1)}
              </InsertSlot>
            )}
          </div>
        );
      })}

      {!readOnly && <div className="mt-6">{renderBar(blocks.length)}</div>}
    </div>
  );
}
