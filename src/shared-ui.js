/** Hooks and menu-row primitives shared by feature modules. */
import { h, useCallback, useSyncExternalStore, primitives } from "./runtime.js";
function useSessionsSnapshot(ctx) {
  const sessions = ctx.get("sessions");
  const subscribe = useCallback(
    (listener) => sessions.list.subscribe(listener),
    [sessions],
  );
  const getSnapshot = useCallback(
    () => sessions.list.getSnapshot(),
    [sessions],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function useWorkspacesSnapshot(ctx) {
  const workspaces = ctx.get("workspaces");
  const subscribe = useCallback(
    (listener) => workspaces.list.subscribe(listener),
    [workspaces],
  );
  const getSnapshot = useCallback(
    () => workspaces.list.getSnapshot(),
    [workspaces],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function useMenuItemClose(useMenuOpenState) {
  // This hook is supplied by the workspace menu slot; keeping the call
  // unconditional preserves hook order for every menu row.
  const [, setOpen] = useMenuOpenState();
  return useCallback(() => setOpen(false), [setOpen]);
}

function MenuRow({ onSelect, disabled, separatorBefore, children }) {
  const Component = primitives.MenuItemButton;
  if (typeof Component === "function") {
    return h(
      Component,
      {
        onSelect,
        disabled: disabled === true,
        separatorBefore: separatorBefore === true,
      },
      children,
    );
  }
  return h(
    "button",
    {
      type: "button",
      role: "menuitem",
      className: "hy-tab-menu-item",
      disabled: disabled === true,
      onClick: onSelect,
      "data-separator-before": separatorBefore === true ? "" : undefined,
    },
    children,
  );
}

export {
  useSessionsSnapshot,
  useWorkspacesSnapshot,
  useMenuItemClose,
  MenuRow,
};
