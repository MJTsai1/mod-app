"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++nextToastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg"
            style={{
              borderColor: toast.type === "success" ? "var(--color-success)" : "var(--color-danger)",
              background: toast.type === "success" ? "var(--color-success-bg)" : "var(--color-danger-bg)",
              color: toast.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            }}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
