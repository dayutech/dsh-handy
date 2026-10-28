/** Workspace-scoped nested session groups and their sidebar layer. */
import { h, ReactDOM, ReactDOMClient } from "./runtime.js";
import { state, store, useHandy } from "./state.js";
import { useSessionsSnapshot, useWorkspacesSnapshot } from "./shared-ui.js";
import { startSessionDrag, endSessionDrag } from "./overlays.js";
import { currentSessionId, sessionTitle, formatTime } from "./session.js";
function FolderGlyph({ open }) {
  return h(
    "svg",
    {
      width: 16,
      height: 16,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      strokeWidth: 1,
    },
    h("path", {
      d: open
        ? "M1.5 3.1c0-.55.45-1 1-1h2.93c.24 0 .48.09.66.25l1.62 1.43c.18.16.41.25.66.25h4.12c.55 0 1 .44 1 1v1.1H1.5V3.1Z"
        : "M1.5 3.1c0-.55.45-1 1-1h2.93c.24 0 .48.09.66.25l1.62 1.43c.18.16.41.25.66.25h4.12c.55 0 1 .44 1 1v7.85c0 .55-.45 1-1 1h-11c-.55 0-1-.45-1-1V3.1Z",
      stroke: "currentColor",
    }),
    h("path", {
      d: open
        ? "M1.85 6.4h12.3l-1.2 5.4c-.1.45-.5.77-.96.77H2.4c-.6 0-1.04-.55-.9-1.13L2.7 6.4h-.85Z"
        : "M3.6 7.7h8.8",
      stroke: "currentColor",
    }),
  );
}

function GroupSessionLine({
  session,
  group,
  depth,
  state,
  actions,
  t,
  locale,
  currentId,
}) {
  const highlighted = state.highlights[session.id] !== undefined;
  return h(
    "div",
    {
      className: "hy-gsession",
      role: "treeitem",
      "data-current": session.id === currentId ? "true" : "false",
      "data-highlight": highlighted ? "true" : "false",
      style: { paddingLeft: `${34 + (depth - 1) * 14}px` },
      title: sessionTitle(session, t),
      draggable: true,
      onDragStart: (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("button, a, input, textarea")
        ) {
          event.preventDefault();
          return;
        }
        startSessionDrag(event, session.id, group.workspaceId);
      },
      onDragEnd: endSessionDrag,
      onClick: () => actions.openSession(session.id),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          actions.openSession(session.id);
        }
      },
      tabIndex: 0,
    },
    h("span", { className: "hy-gsession-dot", "aria-hidden": "true" }),
    h("span", { className: "hy-gsession-title" }, sessionTitle(session, t)),
    h(
      "span",
      { className: "hy-gsession-time" },
      formatTime(session.updatedAt, locale),
    ),
    h(
      "button",
      {
        type: "button",
        className: "hy-gsession-star",
        "data-on": highlighted ? "true" : "false",
        title: t(highlighted ? "row.unhighlight" : "row.highlight"),
        "aria-label": t(highlighted ? "row.unhighlight" : "row.highlight"),
        onClick: (event) => {
          event.stopPropagation();
          actions.toggleHighlight(session.id);
        },
      },
      highlighted ? "★" : "☆",
    ),
    h(
      "button",
      {
        type: "button",
        className: "hy-gsession-menu",
        title: t("groups.sessionMenu"),
        "aria-label": t("groups.sessionMenu"),
        onClick: (event) => {
          event.stopPropagation();
          actions.showSessionMenu(event.currentTarget, session.id, group.id);
        },
      },
      "⋯",
    ),
  );
}

function GroupBranch({
  groupId,
  depth,
  groups,
  workspace,
  sessions,
  state,
  actions,
  t,
  locale,
  currentId,
}) {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (group === undefined || group.workspaceId !== workspace.workspaceId)
    return null;
  const children = groups
    .filter((candidate) => candidate.parentId === groupId)
    .sort((left, right) => left.createdAt - right.createdAt);
  const rows = group.sessionIds
    .filter((id) => workspace.sessionIds.includes(id))
    .map((id) => sessions[id])
    .filter((session) => session !== undefined);
  const branchContainsCurrent = (id) => {
    const candidate = groups.find((group) => group.id === id);
    if (candidate === undefined) return false;
    if (candidate.sessionIds.includes(currentId)) return true;
    return groups.some(
      (child) => child.parentId === id && branchContainsCurrent(child.id),
    );
  };
  const containsCurrent = branchContainsCurrent(groupId);
  return h(
    "div",
    { className: "hy-groups", role: "group" },
    h(
      "div",
      {
        className: "hy-group-row",
        role: "treeitem",
        "aria-expanded": group.expanded,
        "data-current": containsCurrent ? "true" : "false",
        style: { paddingLeft: `${18 + (depth - 1) * 14}px` },
        onDragOver: (event) => {
          if (draggedSession === null) return;
          event.preventDefault();
          if (event.dataTransfer !== null)
            event.dataTransfer.dropEffect = "move";
          event.currentTarget.setAttribute(
            "data-handy-drop",
            draggedSession.workspaceId === group.workspaceId
              ? "true"
              : "invalid",
          );
        },
        onDragLeave: (event) => {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          )
            return;
          event.currentTarget.removeAttribute("data-handy-drop");
        },
        onDrop: (event) => {
          event.preventDefault();
          const dragged = draggedSession;
          endSessionDrag();
          if (dragged === null) return;
          if (dragged.workspaceId !== group.workspaceId) {
            actions.say("groups.crossWorkspace", undefined, "error");
            return;
          }
          actions.addSessionToGroup(groupId, dragged.sessionId);
        },
        onClick: () => actions.toggleGroup(groupId),
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            actions.toggleGroup(groupId);
          }
        },
        tabIndex: 0,
      },
      h(
        "span",
        { className: "hy-group-chevron", "aria-hidden": "true" },
        group.expanded ? "▾" : "▸",
      ),
      h(
        "span",
        { className: "hy-group-folder" },
        h(FolderGlyph, { open: group.expanded }),
      ),
      h("span", { className: "hy-group-name", title: group.name }, group.name),
      h("span", { className: "hy-group-count" }, String(rows.length)),
      h(
        "button",
        {
          type: "button",
          className: "hy-group-menu",
          title: t("groups.groupMenu"),
          "aria-label": t("groups.groupMenu"),
          onClick: (event) => {
            event.stopPropagation();
            actions.showGroupMenu(event.currentTarget, groupId);
          },
        },
        "⋯",
      ),
    ),
    group.expanded
      ? h(
          "div",
          { role: "group" },
          children.map((child) =>
            h(GroupBranch, {
              key: child.id,
              groupId: child.id,
              depth: depth + 1,
              groups,
              workspace,
              sessions,
              state,
              actions,
              t,
              locale,
              currentId,
            }),
          ),
          rows.map((session) =>
            h(GroupSessionLine, {
              key: session.id,
              session,
              group,
              depth,
              state,
              actions,
              t,
              locale,
              currentId,
            }),
          ),
        )
      : null,
  );
}

function WorkspaceGroupLayer({ workspaceId, ctx, store, actions, t, locale }) {
  const state = useHandy();
  const sessions = useSessionsSnapshot(ctx).byId ?? {};
  const workspaces = useWorkspacesSnapshot(ctx);
  const workspace = workspaces.items?.find(
    (item) => item.workspaceId === workspaceId,
  );
  if (workspace === undefined) return null;
  const groups = state.groups.filter(
    (group) => group.workspaceId === workspaceId,
  );
  if (groups.length === 0) return null;
  const roots = groups
    .filter((group) => group.parentId === null)
    .sort((left, right) => left.createdAt - right.createdAt);
  const currentId = currentSessionId({ byId: sessions });
  return h(
    "div",
    { className: "hy-groups-layer", "data-workspace-id": workspaceId },
    roots.map((group) =>
      h(GroupBranch, {
        key: group.id,
        groupId: group.id,
        depth: 1,
        groups,
        workspace,
        sessions,
        state,
        actions,
        t,
        locale,
        currentId,
      }),
    ),
  );
}

function mountReactRoot(container) {
  if (ReactDOMClient?.createRoot !== undefined)
    return ReactDOMClient.createRoot(container);
  if (ReactDOM?.createRoot !== undefined) return ReactDOM.createRoot(container);
  if (ReactDOM?.render !== undefined) {
    return {
      render(element) {
        ReactDOM.render(element, container);
      },
      unmount() {
        ReactDOM.unmountComponentAtNode(container);
      },
    };
  }
  return null;
}

function installGroupSidebar(ctx, actions, t, locale) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {};
    const layers = new Map();
    let scheduled = false;
    let sessionWorkspace = new Map();

    const sync = () => {
      const rows = [
        ...document.querySelectorAll('[data-row-key^="workspace:"]'),
      ];
      const workspaceIds = new Set(
        rows
          .map((row) =>
            row.getAttribute("data-row-key")?.slice("workspace:".length),
          )
          .filter(Boolean),
      );
      const activeGroups = state.groups.filter((group) =>
        workspaceIds.has(group.workspaceId),
      );
      const seen = new Set();

      for (const row of rows) {
        const workspaceId = row
          .getAttribute("data-row-key")
          ?.slice("workspace:".length);
        if (!workspaceId) continue;
        const groups = activeGroups.filter(
          (group) => group.workspaceId === workspaceId,
        );
        const span = row.parentElement;
        const section = span?.parentElement;
        if (
          span === null ||
          span === undefined ||
          section === null ||
          section === undefined
        )
          continue;

        if (groups.length === 0) {
          const existing = layers.get(workspaceId);
          if (existing !== undefined) {
            existing.root.unmount();
            existing.container.remove();
            layers.delete(workspaceId);
          }
          continue;
        }

        let layer = layers.get(workspaceId);
        const created = layer === undefined || !layer.container.isConnected;
        if (created) {
          if (layer !== undefined) {
            try {
              layer.root.unmount();
            } catch {
              // The detached root may already be gone.
            }
          }
          const container = document.createElement("div");
          container.setAttribute("data-handy-group-layer", workspaceId);
          section.insertBefore(container, span.nextSibling);
          const root = mountReactRoot(container);
          if (root === null) {
            container.remove();
            continue;
          }
          layer = { container, root };
          layers.set(workspaceId, layer);
        } else if (
          layer.container.previousElementSibling !== span ||
          layer.container.parentElement !== section
        ) {
          section.insertBefore(layer.container, span.nextSibling);
        }

        const visible = row.getAttribute("aria-expanded") === "true";
        if (layer.container.style.display !== (visible ? "" : "none")) {
          layer.container.style.display = visible ? "" : "none";
        }
        if (created) {
          layer.root.render(
            h(WorkspaceGroupLayer, {
              workspaceId,
              ctx,
              store,
              actions,
              t,
              locale,
            }),
          );
        }
        seen.add(workspaceId);
      }

      for (const [workspaceId, layer] of [...layers]) {
        if (seen.has(workspaceId)) continue;
        try {
          layer.root.unmount();
        } catch {
          // The layer may already be detached.
        }
        layer.container.remove();
        layers.delete(workspaceId);
      }

      const workspaceSnapshot = ctx.get("workspaces")?.list?.getSnapshot?.();
      const workspaceSessionSets = new Map(
        (workspaceSnapshot?.items ?? []).map((item) => [
          item.workspaceId,
          new Set(item.sessionIds),
        ]),
      );
      sessionWorkspace = new Map();
      for (const item of workspaceSnapshot?.items ?? []) {
        for (const sessionId of item.sessionIds)
          sessionWorkspace.set(sessionId, item.workspaceId);
      }
      const grouped = new Set();
      for (const group of activeGroups) {
        if (!seen.has(group.workspaceId)) continue;
        const members = workspaceSessionSets.get(group.workspaceId);
        if (members === undefined) continue;
        for (const sessionId of group.sessionIds) {
          if (members.has(sessionId)) grouped.add(sessionId);
        }
      }
      for (const row of document.querySelectorAll(
        '[data-row-key^="session:"]',
      )) {
        const sessionId = row
          .getAttribute("data-row-key")
          ?.slice("session:".length);
        const span = row.parentElement;
        if (span === null || span === undefined) continue;
        if (
          !row.hasAttribute("data-handy-draggable") &&
          typeof sessionId === "string"
        ) {
          row.setAttribute("data-handy-draggable", "true");
          row.draggable = true;
          row.addEventListener("dragstart", (event) => {
            const target = event.target;
            if (
              target instanceof Element &&
              target.closest("button, a, input, textarea")
            ) {
              event.preventDefault();
              return;
            }
            const id = row
              .getAttribute("data-row-key")
              ?.slice("session:".length);
            startSessionDrag(event, id, sessionWorkspace.get(id));
          });
          row.addEventListener("dragend", endSessionDrag);
        }
        if (row.draggable !== true) row.draggable = true;
        const desired = grouped.has(sessionId) ? "none" : "";
        if (span.style.display !== desired) span.style.display = desired;
      }
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        sync();
      };
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(run);
      else globalThis.setTimeout(run, 16);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });
    const disposeStore = store.subscribe(schedule);
    const sessions = ctx.get("sessions");
    const disposeSessions = sessions?.list?.subscribe?.(schedule);
    const workspaces = ctx.get("workspaces");
    const disposeWorkspaces = workspaces?.list?.subscribe?.(schedule);
    schedule();

    return () => {
      observer.disconnect();
      disposeStore();
      disposeSessions?.();
      disposeWorkspaces?.();
      for (const layer of layers.values()) {
        try {
          layer.root.unmount();
        } catch {
          // The layer may already be detached.
        }
        layer.container.remove();
      }
      layers.clear();
    };
  }, "dsh-handy: sidebar session groups");
}

function installWorkspaceMenu(ctx, actions, t) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {};
    let scheduled = false;
    const sync = () => {
      const row = [
        ...document.querySelectorAll('[data-row-key^="workspace:"]'),
      ].find((candidate) => String(candidate.className).includes("menuOpen"));
      if (row === undefined) return;
      const workspaceId = row
        .getAttribute("data-row-key")
        ?.slice("workspace:".length);
      if (!workspaceId) return;
      const menus = [...document.querySelectorAll('[role="menu"]')].filter(
        (menu) => !menu.hasAttribute("data-handy-menu"),
      );
      const menu = menus.at(-1);
      if (
        menu === undefined ||
        menu.querySelector("[data-handy-ws-menu]") !== null
      )
        return;
      const items = [...menu.querySelectorAll('[role="menuitem"]')];
      if (items.length === 0) return;
      const danger = items.some((item) =>
        String(item.className).includes("danger"),
      );
      if (!danger) return;
      const firstWrap = items[0].parentElement;
      if (firstWrap === null) return;
      const clone = firstWrap.cloneNode(true);
      clone.setAttribute("data-handy-ws-menu", "true");
      const button = clone.querySelector('[role="menuitem"]');
      if (button === null) return;
      const spans = button.querySelectorAll("span");
      if (spans[0] !== undefined) {
        spans[0].innerHTML =
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke-width="1"><path d="M8 3v10M3 8h10" stroke="currentColor"/></svg>';
      }
      if (spans[spans.length - 1] !== undefined) {
        spans[spans.length - 1].textContent = t("groups.action");
      } else {
        button.textContent = t("groups.action");
      }
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const outsidePointer =
          typeof PointerEvent === "function"
            ? new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
              })
            : new MouseEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
              });
        document.body.dispatchEvent(outsidePointer);
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
          }),
        );
        globalThis.setTimeout(
          () => actions.promptCreateGroup(workspaceId, null),
          0,
        );
      });
      const lastWrap = items[items.length - 1].parentElement;
      if (lastWrap?.parentElement)
        lastWrap.parentElement.insertBefore(clone, lastWrap);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        sync();
      };
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(run);
      else globalThis.setTimeout(run, 16);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-expanded"],
    });
    schedule();
    return () => observer.disconnect();
  }, "dsh-handy: workspace menu entry");
}

export { mountReactRoot, installGroupSidebar, installWorkspaceMenu };
