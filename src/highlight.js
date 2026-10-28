/** Session highlight star, menu entry, row observer, and cross-window sync. */
import { h } from "./runtime.js";
import { state, store, commit, useHandy, loadState } from "./state.js";
import { MenuRow, useMenuItemClose } from "./shared-ui.js";
function StarButton({ sessionId, store, actions, t }) {
  const state = useHandy();
  const active = state.highlights[sessionId] !== undefined;
  return h(
    "button",
    {
      type: "button",
      className: "hy-row-action",
      "data-on": active ? "true" : "false",
      "aria-label": t(active ? "row.unhighlight" : "row.highlight"),
      title: t(active ? "row.unhighlight" : "row.highlight"),
      "aria-pressed": active,
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.toggleHighlight(sessionId);
      },
    },
    active ? "★" : "☆",
  );
}

function HighlightMenuItem({ sessionId, useMenuOpenState, store, actions, t }) {
  const state = useHandy();
  const active = state.highlights[sessionId] !== undefined;
  const close = useMenuItemClose(useMenuOpenState);
  return h(
    MenuRow,
    {
      separatorBefore: true,
      onSelect: () => {
        close();
        actions.toggleHighlight(sessionId);
      },
    },
    active ? t("menu.unhighlight") : t("menu.highlight"),
  );
}

function syncHighlightRows() {
  if (typeof document === "undefined") return;
  const highlighted = state.highlights;
  for (const row of document.querySelectorAll('[data-row-key^="session:"]')) {
    const key = row.getAttribute("data-row-key");
    const sessionId = key === null ? "" : key.slice("session:".length);
    if (highlighted[sessionId] !== undefined)
      row.setAttribute("data-handy-highlight", "true");
    else row.removeAttribute("data-handy-highlight");
  }
}

function installHighlightObserver(ctx) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {};
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        syncHighlightRows();
      };
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(run);
      else globalThis.setTimeout(run, 16);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    const unsubscribe = store.subscribe(schedule);
    schedule();
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, "dsh-handy: row highlight observer");
}

function installStorageSync(ctx) {
  return ctx.effect(() => {
    if (typeof window === "undefined") return () => {};
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      const next = loadState();
      commit(
        {
          highlights: next.highlights,
          groups: next.groups,
          forks: next.forks,
        },
        { persist: false },
      );
      syncHighlightRows();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, "dsh-handy: cross-window storage sync");
}

export {
  StarButton,
  HighlightMenuItem,
  syncHighlightRows,
  installHighlightObserver,
  installStorageSync,
};
