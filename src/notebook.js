/** Conversation tab: a per-session scratch notebook. */
import { h, useEffect, useRef, useState } from "./runtime.js";
import { useHandy } from "./state.js";

export function NotebookView({
  sessionId: viewSessionId,
  handySessionId,
  handyActions,
  t: viewT,
}) {
  const state = useHandy();
  const sid = viewSessionId ?? handySessionId;
  const stored = sid === undefined ? "" : (state.notebooks?.[sid] ?? "");
  const [draft, setDraft] = useState(stored);
  const timer = useRef(null);
  const latest = useRef(stored);

  useEffect(() => {
    latest.current = stored;
    setDraft(stored);
  }, [sid, stored]);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        globalThis.clearTimeout(timer.current);
        timer.current = null;
        if (sid !== undefined) handyActions?.setNotebook(sid, latest.current);
      }
    },
    [sid, handyActions],
  );

  const flush = (value) => {
    if (timer.current !== null) {
      globalThis.clearTimeout(timer.current);
      timer.current = null;
    }
    if (sid !== undefined) handyActions?.setNotebook(sid, value);
  };

  const onChange = (value) => {
    latest.current = value;
    setDraft(value);
    if (timer.current !== null) globalThis.clearTimeout(timer.current);
    timer.current = globalThis.setTimeout(() => {
      timer.current = null;
      if (sid !== undefined) handyActions?.setNotebook(sid, value);
    }, 250);
  };

  const count = [...draft].length;
  const t = typeof viewT === "function" ? viewT : (key) => key;

  if (sid === undefined) {
    return h(
      "div",
      { className: "hy-notebook" },
      h("div", { className: "hy-empty" }, t("common.noSession")),
    );
  }

  return h(
    "div",
    { className: "hy-notebook" },
    h(
      "div",
      { className: "hy-notebook-head" },
      h(
        "div",
        { className: "hy-notebook-head-copy" },
        h("h2", { className: "hy-notebook-title" }, t("notebook.title")),
        h("div", { className: "hy-notebook-hint" }, t("notebook.hint")),
      ),
      h(
        "span",
        { className: "hy-notebook-count" },
        t("notebook.chars", { n: count }),
      ),
    ),
    h("textarea", {
      className: "hy-notebook-editor",
      value: draft,
      placeholder: t("notebook.placeholder"),
      "aria-label": t("notebook.title"),
      onChange: (event) => onChange(event.target.value),
      onBlur: () => flush(draft),
    }),
    h(
      "div",
      { className: "hy-notebook-foot" },
      h(
        "button",
        {
          type: "button",
          className: "hy-btn hy-btn-sm",
          onClick: () => {
            if (timer.current !== null) {
              globalThis.clearTimeout(timer.current);
              timer.current = null;
            }
            latest.current = "";
            setDraft("");
            handyActions?.clearNotebook(sid);
          },
        },
        t("notebook.clear"),
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-btn hy-btn-sm",
          onClick: () => handyActions?.copy(draft),
        },
        t("notebook.copy"),
      ),
      h("span", { className: "hy-notebook-saved" }, t("notebook.saved")),
    ),
  );
}
