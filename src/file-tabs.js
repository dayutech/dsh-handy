/** Right-sidebar file-tab bulk-close menu. */
import { h } from "./runtime.js";
import { MenuRow } from "./shared-ui.js";
function isFileTab(tab) {
  if (tab === null || typeof tab !== "object") return false;
  const contentId = String(tab.contentId ?? "");
  return (
    contentId.includes("dsh-resource://file/") ||
    contentId.includes("/file/") ||
    tab.kind === "document"
  );
}

function closeTabIds(sidebar, ids) {
  if (sidebar === null || sidebar === undefined) return;
  for (const id of [...ids].reverse()) {
    try {
      sidebar.close(id);
    } catch (error) {
      console.warn("dsh-handy: close tab failed", id, error);
    }
  }
}

function FileTabMenuAction({ tab, dismiss, mode, sessionId, store, t }) {
  // The controller is a lazy service in the browser root; read it at render
  // time so the menu stays useful even when it is installed after this
  // plugin's own apply.
  const controller = globalThis.__dshHandySidebarRight;
  if (!isFileTab(tab)) return null;

  const tabId = tab.id;
  const safeTabId = String(tabId).replaceAll('"', '\\"');
  const tabElement =
    typeof document !== "undefined"
      ? document.querySelector(`[data-dockkit-tab="${safeTabId}"]`)
      : null;
  if (tabElement === null) return null;
  const pane = tabElement.closest("[data-dockkit-pane], [data-dockkit-float]");
  const paneTabs =
    pane === null
      ? []
      : [...pane.querySelectorAll("[data-dockkit-tab]")]
          .map((element) => element.dataset.dockkitTab)
          .filter(Boolean);
  const safeSessionId = String(sessionId).replaceAll('"', '\\"');
  const allTabs =
    typeof document === "undefined"
      ? []
      : [
          ...document.querySelectorAll(
            `[data-sidebar-right-session="${safeSessionId}"] [data-dockkit-tab]`,
          ),
        ]
          .map((element) => element.dataset.dockkitTab)
          .filter(Boolean);
  const index = paneTabs.indexOf(tabId);

  let disabled = false;
  let ids = [];
  let label = "";
  if (mode === "current") {
    label = t("file.closeCurrent");
    ids = [tabId];
  } else if (mode === "left") {
    label = t("file.closeLeft");
    ids = index > 0 ? paneTabs.slice(0, index) : [];
    disabled = ids.length === 0;
  } else if (mode === "right") {
    label = t("file.closeRight");
    ids = index >= 0 ? paneTabs.slice(index + 1) : [];
    disabled = ids.length === 0;
  } else {
    label = t("file.closeAll");
    ids = allTabs;
    disabled = ids.length === 0;
  }

  return h(
    MenuRow,
    {
      separatorBefore: mode === "current",
      disabled,
      onSelect: () => {
        dismiss?.();
        closeTabIds(controller ?? globalThis.__dshHandySidebarRight, ids);
      },
    },
    label,
  );
}

export { isFileTab, closeTabIds, FileTabMenuAction };
