/*
 * The two global overlays: the toast pill and the confirm modal.
 *
 * Both close on Escape — the key handler lives in App so a single listener
 * owns the precedence (modal, then sheet).
 */

import { useEffect, useRef } from "react";
import { useT } from "../i18n";
import { useAppStore } from "../state/store";
import { Icon } from "./Icon";

/* ------------------------------------------------------------------ toast */

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const dismiss = useAppStore((s) => s.dismissToast);

  if (!toast) return null;

  return (
    <div className="lp-toastwrap" role="status" aria-live="polite">
      <div className="lp-toast">
        <Icon name={toast.icon} size={16} />
        {toast.msg}
        {toast.actionLabel ? (
          <button
            type="button"
            className="lp-toast__action"
            onClick={() => {
              toast.action?.();
              dismiss();
            }}
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

export function Modal() {
  const t = useT();
  const modal = useAppStore((s) => s.modal);
  const close = useAppStore((s) => s.closeModal);
  const confirm = useAppStore((s) => s.confirmModal);
  const confirmRef = useRef<HTMLButtonElement>(null);

  /* Move focus into the dialog so Escape and Enter both land somewhere sane. */
  useEffect(() => {
    if (modal) confirmRef.current?.focus();
  }, [modal]);

  if (!modal) return null;

  return (
    <div className="lp-scrim lp-scrim--center" onClick={close} role="presentation">
      <div
        className="lp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lp-modal-title"
      >
        <div className="lp-modal__head">
          <span className={`lp-modal__ico${modal.danger ? " lp-modal__ico--danger" : ""}`}>
            <Icon name={modal.icon ?? "triangle-alert"} size={19} />
          </span>
          <h2 className="lp-modal__title" id="lp-modal-title">
            {modal.title}
          </h2>
        </div>

        <p className="lp-modal__body">{modal.body}</p>

        <div className="lp-modal__foot">
          <button type="button" className="lp-gi lp-btn--secondary lp-modal__cancel" onClick={close}>
            {t("chrome.modal.keep")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`lp-btn lp-modal__confirm${modal.danger ? " lp-modal__confirm--danger" : ""}`}
            onClick={confirm}
          >
            {modal.confirmLabel ?? t("chrome.modal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
