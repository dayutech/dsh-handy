/** Conversation tab: workspace-wide session tree. */
import { h, handyT, getActiveCtx } from "./runtime.js";
import { useHandy } from "./state.js";
import { useSessionsSnapshot, useWorkspacesSnapshot } from "./shared-ui.js";
import { sessionTitle, basename, formatTime } from "./session.js";
import { fmt } from "./i18n.js";
function ConversationTreeView({
  sessionId: viewSessionId,
  handySessionId,
  handyActions,
  t: viewT,
}) {
  const state = useHandy();
  const env = getActiveCtx();
  const sessions = useSessionsSnapshot(env);
  const workspaces = useWorkspacesSnapshot(env);
  const t = typeof viewT === "function" ? viewT : handyT;
  const locale =
    (env?.locale?.getLocale?.().active ?? "zh") === "en" ? "en" : "zh";
  const sid = viewSessionId ?? handySessionId;
  const workspace = workspaces.items?.find((item) =>
    item.sessionIds.includes(sid),
  );
  if (workspace === undefined) {
    return h(
      "div",
      { className: "hy-wtree-view" },
      h(
        "div",
        { className: "hy-wtree-head" },
        h("h2", { className: "hy-wtree-title" }, t("tree.viewTab")),
      ),
      h("div", { className: "hy-empty" }, t("tree.noWorkspace")),
    );
  }

  const byId = sessions.byId ?? {};
  const ids = workspace.sessionIds.filter((id) => byId[id] !== undefined);
  const idSet = new Set(ids);
  const children = new Map();
  const roots = [];
  for (const id of ids) {
    const parentId = byId[id]?.parentSessionId;
    if (typeof parentId === "string" && idSet.has(parentId)) {
      const bucket = children.get(parentId) ?? [];
      bucket.push(id);
      children.set(parentId, bucket);
    } else {
      roots.push(id);
    }
  }
  const byCreated = (left, right) =>
    (byId[left]?.createdAt ?? byId[left]?.updatedAt ?? 0) -
    (byId[right]?.createdAt ?? byId[right]?.updatedAt ?? 0);
  roots.sort(byCreated);
  for (const bucket of children.values()) bucket.sort(byCreated);

  const renderNode = (id, depth, stack) => {
    if (stack.has(id)) return null;
    const summary = byId[id];
    if (summary === undefined) return null;
    const nextStack = new Set(stack);
    nextStack.add(id);
    const kids = children.get(id) ?? [];
    const parent = byId[summary.parentSessionId];
    const fork = state.forks[id];
    const forkLabel =
      parent === undefined
        ? typeof summary.parentSessionId === "string"
          ? t("tree.parentOutside")
          : ""
        : Number.isSafeInteger(fork?.turn)
          ? fmt(t, "tree.forkedAt", {
              name: sessionTitle(parent, t),
              n: fork.turn,
            })
          : fmt(t, "tree.forkedFrom", { name: sessionTitle(parent, t) });
    const current = id === sid;
    const highlighted = state.highlights[id] !== undefined;
    return h(
      "div",
      { className: "hy-wtree-node", key: id, "data-depth": depth },
      h(
        "div",
        {
          className: "hy-wtree-card",
          role: "button",
          tabIndex: 0,
          "data-current": current ? "true" : "false",
          "data-highlight": highlighted ? "true" : "false",
          title: sessionTitle(summary, t),
          onClick: () => handyActions?.openSession(id),
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handyActions?.openSession(id);
            }
          },
        },
        h("span", { className: "hy-wtree-dot", "aria-hidden": "true" }),
        h(
          "span",
          { className: "hy-wtree-main" },
          h(
            "span",
            { className: "hy-wtree-line" },
            h("span", { className: "hy-wtree-name" }, sessionTitle(summary, t)),
            current
              ? h("span", { className: "hy-wtree-badge" }, t("tree.currentTag"))
              : null,
            highlighted
              ? h(
                  "span",
                  { className: "hy-wtree-star", title: t("tree.important") },
                  "★",
                )
              : null,
          ),
          h(
            "span",
            { className: "hy-wtree-meta" },
            [
              forkLabel,
              formatTime(summary.updatedAt, locale),
              basename(summary.cwd),
            ]
              .filter(Boolean)
              .join(" · "),
          ),
        ),
        kids.length > 0
          ? h(
              "span",
              { className: "hy-wtree-count" },
              fmt(t, "tree.branchCount", { n: kids.length }),
            )
          : null,
      ),
      kids.length > 0
        ? h(
            "div",
            { className: "hy-wtree-children", role: "group" },
            kids.map((childId) => renderNode(childId, depth + 1, nextStack)),
          )
        : null,
    );
  };

  const workspaceLabel =
    typeof workspace.title === "string" && workspace.title !== ""
      ? workspace.title
      : basename(workspace.path);

  return h(
    "div",
    { className: "hy-wtree-view" },
    h(
      "div",
      { className: "hy-wtree-head" },
      h("h2", { className: "hy-wtree-title" }, t("tree.viewTab")),
      h(
        "span",
        { className: "hy-wtree-workspace" },
        fmt(t, "tree.workspace", { name: workspaceLabel }),
      ),
      h(
        "span",
        { className: "hy-wtree-total" },
        fmt(t, "tree.sessionCount", { n: ids.length }),
      ),
    ),
    ids.length === 0
      ? h("div", { className: "hy-empty" }, t("tree.emptyWorkspace"))
      : h(
          "div",
          {
            className: "hy-wtree",
            role: "tree",
            "aria-label": t("tree.viewTab"),
          },
          roots.map((rootId) => renderNode(rootId, 0, new Set())),
        ),
    h("div", { className: "hy-wtree-legend" }, t("tree.legendView")),
  );
}

export { ConversationTreeView };
