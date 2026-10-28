// components/editor/EditorContext.tsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Editor } from "@tiptap/react";

type Ctx = {
  activeEditor: Editor | null;
  setActiveEditor: Dispatch<SetStateAction<Editor | null>>;
};

const EditorCtx = createContext<Ctx>({
  activeEditor: null,
  setActiveEditor: () => {},
});

/** يحمل المحرر النصي الذي عليه التركيز حالياً، فيعمل شريط تنسيق واحد لكل الكتل. */
export function ActiveEditorProvider({ children }: { children: ReactNode }) {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const value = useMemo(() => ({ activeEditor, setActiveEditor }), [activeEditor]);
  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>;
}

export const useActiveEditor = () => useContext(EditorCtx);
