"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "border border-border",
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      }}
    />
  );
}
