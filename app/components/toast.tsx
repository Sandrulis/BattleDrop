"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastVariant = "default" | "error" | "success";

export type ToastState = {
  id: number;
  message: string;
  variant: ToastVariant;
};

const DEFAULT_DURATION_MS = 4000;

export function useToast(durationMs = DEFAULT_DURATION_MS) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      idRef.current += 1;
      setToast({ id: idRef.current, message, variant });
    },
    [],
  );

  return { toast, showToast, dismissToast, durationMs };
}

type ToastProps = {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ toast, onDismiss, durationMs = DEFAULT_DURATION_MS }: ToastProps) {
  const remainingMsRef = useRef(durationMs);
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleDismiss = useCallback(() => {
    clearTimer();
    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      onDismiss();
    }, remainingMsRef.current);
  }, [onDismiss]);

  useEffect(() => {
    if (!toast) {
      clearTimer();
      return;
    }

    remainingMsRef.current = durationMs;
    scheduleDismiss();

    return clearTimer;
  }, [toast?.id, durationMs, scheduleDismiss]);

  if (!toast) return null;

  const handleMouseEnter = () => {
    clearTimer();
    if (startedAtRef.current !== null) {
      const elapsed = Date.now() - startedAtRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    if (remainingMsRef.current <= 0) {
      onDismiss();
      return;
    }

    scheduleDismiss();
  };

  const variantClassName =
    toast.variant === "error"
      ? "bg-red-600"
      : toast.variant === "success"
        ? "bg-emerald-700"
        : "bg-zinc-900";

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-6 left-1/2 z-[110] max-w-md -translate-x-1/2 cursor-default rounded-lg px-4 py-3 text-sm text-white shadow-lg select-none ${variantClassName}`}
    >
      {toast.message}
    </div>
  );
}
