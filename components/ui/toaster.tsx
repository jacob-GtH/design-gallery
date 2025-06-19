// components/ui/toast.tsx
"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-center"
      richColors
      dir="rtl"
      toastOptions={{
        classNames: {
          toast: 'font-sans text-right',
          title: 'text-right',
          description: 'text-right',
        }
      }}
    />
  )
}
