import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const activeDialogRef = useRef(null);
  const dialogQueueRef = useRef([]);
  const cancelButtonRef = useRef(null);
  const actionButtonRef = useRef(null);

  const enqueueDialog = useCallback((request) => {
    return new Promise((resolve) => {
      const nextDialog = { ...request, resolve };

      if (activeDialogRef.current) {
        dialogQueueRef.current.push(nextDialog);
        return;
      }

      activeDialogRef.current = nextDialog;
      setDialog(nextDialog);
    });
  }, []);

  const closeDialog = useCallback((result) => {
    const activeDialog = activeDialogRef.current;
    if (!activeDialog) return;

    activeDialog.resolve(result);
    const nextDialog = dialogQueueRef.current.shift() || null;
    activeDialogRef.current = nextDialog;
    setDialog(nextDialog);
  }, []);

  const confirmDialog = useCallback(
    (message, options = {}) =>
      enqueueDialog({
        type: "confirm",
        title: options.title || "Konfirmasi",
        message,
        confirmLabel: options.confirmLabel || "Ya, lanjutkan",
        cancelLabel: options.cancelLabel || "Batal",
        tone: options.tone || "primary",
      }),
    [enqueueDialog],
  );

  const alertDialog = useCallback(
    (message, options = {}) =>
      enqueueDialog({
        type: "alert",
        title: options.title || "Informasi",
        message,
        confirmLabel: options.confirmLabel || "Tutup",
        tone: options.tone || "primary",
      }),
    [enqueueDialog],
  );

  const handleDialogKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog(dialog.type !== "confirm");
        return;
      }

      if (event.key !== "Tab") return;
      const buttons = event.currentTarget.querySelectorAll(
        "button:not(:disabled)",
      );
      if (buttons.length === 0) return;

      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    },
    [closeDialog, dialog],
  );

  useEffect(() => {
    if (!dialog) return;
    const initialFocus =
      dialog.type === "confirm"
        ? cancelButtonRef.current
        : actionButtonRef.current;
    initialFocus?.focus();
  }, [dialog]);

  const contextValue = useMemo(
    () => ({ confirmDialog, alertDialog }),
    [alertDialog, confirmDialog],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <section
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            role={dialog.type === "confirm" ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="global-dialog-title"
            aria-describedby="global-dialog-message"
            onKeyDown={handleDialogKeyDown}
          >
            <h2
              id="global-dialog-title"
              className="text-lg font-semibold text-neutral-dark-gray"
            >
              {dialog.title}
            </h2>
            <p
              id="global-dialog-message"
              className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-dark-gray"
            >
              {dialog.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={actionButtonRef}
                type="button"
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  dialog.tone === "danger"
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    : "bg-primary hover:bg-secondary focus:ring-primary"
                }`}
                onClick={() =>
                  closeDialog(dialog.type === "confirm" ? true : undefined)
                }
              >
                {dialog.confirmLabel}
              </button>
              {dialog.type === "confirm" && (
                <button
                  ref={cancelButtonRef}
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-neutral-dark-gray hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => closeDialog(false)}
                >
                  {dialog.cancelLabel}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog harus digunakan di dalam DialogProvider.");
  }
  return context;
}
