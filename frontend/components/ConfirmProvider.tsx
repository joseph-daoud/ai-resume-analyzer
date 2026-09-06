"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red and defaults focus to Cancel instead,
   *  so an accidental Enter/Space press doesn't trigger something destructive. */
  danger?: boolean;
}

interface PendingConfirm {
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

/**
 * Replaces window.confirm() with a themed, non-blocking dialog:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ message: "Delete this?", danger: true });
 *   if (!ok) return;
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [pending]);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const opts: ConfirmOptions = typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? t("confirm.confirm"),
        cancelLabel: opts.cancelLabel ?? t("confirm.cancel"),
        danger: opts.danger ?? false,
        resolve,
      });
    });
  }, [t]);

  const handleChoice = useCallback((result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  }, [pending]);

  // Let Escape act as Cancel, same as clicking outside the dialog.
  useEffect(() => {
    if (!pending) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleChoice(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pending, handleChoice]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4
                      transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
          onClick={() => handleChoice(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={pending.title ? "confirm-dialog-title" : undefined}
            aria-describedby="confirm-dialog-message"
            className={`bg-paper-raise rounded-2xl border border-line
                        shadow-xl max-w-sm w-full p-6 transition-all duration-200
                        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {pending.title && (
              <h3 id="confirm-dialog-title" className="text-lg font-semibold text-ink mb-2">
                {pending.title}
              </h3>
            )}
            <p id="confirm-dialog-message" className="text-sm text-ink-muted mb-6">
              {pending.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleChoice(false)}
                autoFocus={pending.danger}
                className="px-4 py-2 text-sm font-medium rounded-lg text-ink
                           hover:bg-paper focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-accent transition"
              >
                {pending.cancelLabel}
              </button>
              <button
                onClick={() => handleChoice(true)}
                autoFocus={!pending.danger}
                className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-offset-2 transition
                            ${pending.danger
                              ? "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500"
                              : "bg-accent hover:bg-accent-strong text-white focus-visible:ring-accent"}`}
              >
                {pending.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
