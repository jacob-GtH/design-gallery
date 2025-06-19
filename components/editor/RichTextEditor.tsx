// components/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './editor.css'
 <style></style>

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (content: string) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose outline-none min-h-[100px]',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border-b border-gray-300 pb-4">
      <EditorContent editor={editor} />
    </div>
  )
}
