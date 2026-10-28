/** All user-triggered operations. */
import { state, commit, uid } from "./state.js";
import { fmt } from "./i18n.js";
import {
  showMenu,
  showTextDialog,
  showConfirmDialog,
  showChoiceDialog,
} from "./overlays.js";
import { currentSessionId, sessionTitle, formatTime } from "./session.js";
function makeActions(ctx, t, locale) {
  const say = (key, vars, kind = "info") => {
    commit(
      {
        toast: {
          id: uid("toast"),
          kind,
          message: fmt(t, key, vars),
        },
      },
      { persist: false },
    );
  };

  const workspaceItems = () =>
    ctx.get("workspaces")?.list?.getSnapshot?.()?.items ?? [];
  const workspaceOfSession = (sessionId) =>
    workspaceItems().find((workspace) =>
      workspace.sessionIds.includes(sessionId),
    );
  const workspaceById = (workspaceId) =>
    workspaceItems().find((workspace) => workspace.workspaceId === workspaceId);
  const groupsInWorkspace = (workspaceId) =>
    state.groups.filter((group) => group.workspaceId === workspaceId);
  const groupDepth = (groupId) => {
    let depth = 1;
    let cursor = state.groups.find((group) => group.id === groupId);
    const seen = new Set();
    while (cursor?.parentId !== null && cursor?.parentId !== undefined) {
      if (seen.has(cursor.id)) return 99;
      seen.add(cursor.id);
      cursor = state.groups.find((group) => group.id === cursor.parentId);
      depth += 1;
      if (depth > 3) return depth;
    }
    return depth;
  };
  const descendantGroupIds = (groupId) => {
    const result = [groupId];
    for (let index = 0; index < result.length; index += 1) {
      for (const group of state.groups) {
        if (group.parentId === result[index]) result.push(group.id);
      }
    }
    return result;
  };
  const assignSession = (groupId, sessionId) => {
    const target = state.groups.find((group) => group.id === groupId);
    if (target === undefined) return null;
    const workspace = workspaceOfSession(sessionId);
    if (
      workspace === undefined ||
      workspace.workspaceId !== target.workspaceId
    ) {
      say("groups.crossWorkspace", undefined, "error");
      return null;
    }
    const groups = state.groups.map((group) => {
      const without = group.sessionIds.filter((id) => id !== sessionId);
      if (group.id === groupId) {
        return {
          ...group,
          sessionIds: [...without, sessionId],
          expanded: true,
        };
      }
      return without.length === group.sessionIds.length
        ? group
        : { ...group, sessionIds: without };
    });
    commit({ groups });
    return target;
  };

  const openSession = (sessionId) => {
    if (typeof sessionId !== "string" || sessionId === "") return;
    try {
      ctx.get("uiWorkspace")?.openSession(sessionId);
    } catch (error) {
      console.warn("dsh-handy: cannot open session", error);
    }
  };

  const copy = async (text) => {
    try {
      if (globalThis.navigator?.clipboard?.writeText !== undefined) {
        await globalThis.navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      say("toast.copied");
      return true;
    } catch {
      say("toast.copyFailed", undefined, "error");
      return false;
    }
  };

  const jumpToTurn = (sessionId, turn) => {
    openSession(sessionId);
    let attempts = 0;
    const tick = () => {
      const element = document.querySelector(
        `[data-turn-tail="${Number(turn)}"]`,
      );
      if (element !== null) {
        element.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      attempts += 1;
      if (attempts < 24) globalThis.setTimeout(tick, 250);
    };
    globalThis.setTimeout(tick, 180);
  };

  const api = {
    say,
    openSession,
    copy,
    jumpToTurn,

    dismissToast() {
      commit({ toast: null }, { persist: false });
    },

    toggleHighlight(sessionId) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const highlights = { ...state.highlights };
      const active = highlights[sessionId] !== undefined;
      if (active) delete highlights[sessionId];
      else highlights[sessionId] = { at: Date.now() };
      commit({ highlights });
      say(active ? "toast.highlightOff" : "toast.highlightOn");
    },

    createGroup(workspaceId, parentId, rawName, sessionId) {
      const name = String(rawName ?? "").trim();
      const workspace = workspaceById(workspaceId);
      if (workspace === undefined) {
        say("groups.noWorkspace", undefined, "error");
        return null;
      }
      if (name === "") {
        say("groups.emptyName", undefined, "error");
        return null;
      }
      const siblings = state.groups.filter(
        (group) =>
          group.workspaceId === workspaceId &&
          group.parentId === (parentId ?? null),
      );
      if (
        siblings.some(
          (group) => group.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        say("groups.duplicate", undefined, "error");
        return null;
      }
      if (parentId !== null && parentId !== undefined) {
        const parent = state.groups.find((group) => group.id === parentId);
        if (
          parent === undefined ||
          parent.workspaceId !== workspaceId ||
          groupDepth(parent.id) >= 3
        ) {
          say("groups.depthLimit", undefined, "error");
          return null;
        }
      }
      const group = {
        id: uid("group"),
        workspaceId,
        parentId: parentId ?? null,
        name,
        sessionIds: [],
        expanded: true,
        createdAt: Date.now(),
      };
      commit({ groups: [...state.groups, group] });
      say("toast.groupCreated", { name });
      if (typeof sessionId === "string" && sessionId !== "")
        assignSession(group.id, sessionId);
      return (
        state.groups.find((candidate) => candidate.id === group.id) ?? group
      );
    },

    promptCreateGroup(workspaceId, parentId = null, sessionId = null) {
      const parent =
        parentId === null
          ? undefined
          : state.groups.find((group) => group.id === parentId);
      if (
        parentId !== null &&
        (parent === undefined || groupDepth(parentId) >= 3)
      ) {
        say("groups.depthLimit", undefined, "error");
        return;
      }
      showTextDialog({
        title:
          parent === undefined
            ? t("groups.createTitle")
            : t("groups.createChildTitle"),
        description:
          parent === undefined
            ? t("groups.createDescription")
            : fmt(t, "groups.createChildDescription", { name: parent.name }),
        placeholder: t("groups.namePlaceholder"),
        confirmLabel: t("groups.create"),
        onConfirm: (name) => {
          api.createGroup(workspaceId, parentId, name, sessionId);
        },
      });
    },

    renameGroup(groupId, rawName) {
      const name = String(rawName ?? "").trim();
      if (name === "") return;
      const target = state.groups.find((group) => group.id === groupId);
      if (target === undefined) return;
      if (
        state.groups.some(
          (group) =>
            group.id !== groupId &&
            group.workspaceId === target.workspaceId &&
            group.parentId === target.parentId &&
            group.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        say("groups.duplicate", undefined, "error");
        return;
      }
      commit({
        groups: state.groups.map((group) =>
          group.id === groupId ? { ...group, name } : group,
        ),
      });
    },

    promptRenameGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      showTextDialog({
        title: t("groups.renameTitle"),
        initialValue: group.name,
        placeholder: t("groups.namePlaceholder"),
        confirmLabel: t("common.save"),
        onConfirm: (name) => api.renameGroup(groupId, name),
      });
    },

    deleteGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      const removeIds = new Set(descendantGroupIds(groupId));
      const movedSessions = state.groups
        .filter((candidate) => removeIds.has(candidate.id))
        .flatMap((candidate) => candidate.sessionIds);
      const groups = state.groups
        .filter((candidate) => !removeIds.has(candidate.id))
        .map((candidate) => {
          if (candidate.id !== group.parentId) return candidate;
          return {
            ...candidate,
            sessionIds: [
              ...new Set([...candidate.sessionIds, ...movedSessions]),
            ],
          };
        });
      commit({ groups });
      say("toast.groupDeleted");
    },

    promptDeleteGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      const children = descendantGroupIds(groupId).length - 1;
      showConfirmDialog({
        title: t("groups.deleteTitle"),
        description:
          children > 0
            ? fmt(t, "groups.deleteNestedDescription", {
                name: group.name,
                n: children,
              })
            : fmt(t, "groups.deleteDescription", { name: group.name }),
        confirmLabel: t("common.delete"),
        danger: true,
        onConfirm: () => api.deleteGroup(groupId),
      });
    },

    toggleGroup(groupId) {
      commit({
        groups: state.groups.map((group) =>
          group.id === groupId
            ? { ...group, expanded: !group.expanded }
            : group,
        ),
      });
    },

    addSessionToGroup(groupId, sessionId) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const target = assignSession(groupId, sessionId);
      if (target !== null) say("toast.groupAdded", { name: target.name });
    },

    removeSessionFromGroup(groupId, sessionId) {
      commit({
        groups: state.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                sessionIds: group.sessionIds.filter((id) => id !== sessionId),
              }
            : group,
        ),
      });
      say("toast.groupRemoved");
    },

    pickGroupForSession(sessionId) {
      const workspace = workspaceOfSession(sessionId);
      if (workspace === undefined) {
        say("groups.noWorkspace", undefined, "error");
        return;
      }
      const groups = groupsInWorkspace(workspace.workspaceId);
      if (groups.length === 0) {
        api.promptCreateGroup(workspace.workspaceId, null, sessionId);
        return;
      }
      const options = groups
        .slice()
        .sort((left, right) => left.createdAt - right.createdAt)
        .map((group) => ({
          value: group.id,
          label: `${"— ".repeat(Math.max(0, groupDepth(group.id) - 1))}${group.name}`,
        }));
      showChoiceDialog({
        title: t("groups.pickGroup"),
        description: t("groups.pickGroupDescription"),
        options,
        extra: {
          label: t("groups.createAndAdd"),
          value: "__new__",
        },
        onSelect: (value) => {
          if (value === "__new__") {
            api.promptCreateGroup(workspace.workspaceId, null, sessionId);
            return;
          }
          api.addSessionToGroup(value, sessionId);
        },
      });
    },

    pickSessionForGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      const workspace = workspaceById(group.workspaceId);
      if (workspace === undefined) return;
      const sessions = ctx.get("sessions")?.list?.getSnapshot?.()?.byId ?? {};
      const options = workspace.sessionIds
        .filter((id) => !group.sessionIds.includes(id))
        .map((id) => sessions[id])
        .filter((session) => session !== undefined)
        .map((session) => ({
          value: session.id,
          label: sessionTitle(session, t),
          detail: formatTime(session.updatedAt, locale),
        }));
      if (options.length === 0) {
        say("groups.noUngroupedSessions", undefined, "error");
        return;
      }
      showChoiceDialog({
        title: t("groups.addSessionTitle"),
        description: fmt(t, "groups.addSessionDescription", {
          name: group.name,
        }),
        options,
        onSelect: (sessionId) => api.addSessionToGroup(groupId, sessionId),
      });
    },

    createSessionInGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      const workspace = workspaceById(group.workspaceId);
      if (workspace === undefined) return;
      try {
        ctx
          .get("uiWorkspace")
          ?.startSession(group.workspaceId, { clearPreviousDraft: false });
      } catch (error) {
        say(
          "groups.createSessionFailed",
          { message: error instanceof Error ? error.message : String(error) },
          "error",
        );
        return;
      }
      let attempts = 0;
      const tick = () => {
        const list = ctx.get("sessions")?.list?.getSnapshot?.();
        const current = currentSessionId(list);
        if (
          typeof current === "string" &&
          workspaceOfSession(current)?.workspaceId === group.workspaceId
        ) {
          const target = assignSession(groupId, current);
          if (target !== null) say("toast.groupAdded", { name: target.name });
          return;
        }
        attempts += 1;
        if (attempts < 30) globalThis.setTimeout(tick, 150);
      };
      globalThis.setTimeout(tick, 180);
    },

    showGroupMenu(anchor, groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === undefined) return;
      const items = [
        {
          label: t("groups.addSession"),
          onSelect: () => api.pickSessionForGroup(groupId),
        },
        {
          label: t("groups.newSession"),
          onSelect: () => api.createSessionInGroup(groupId),
        },
      ];
      if (groupDepth(groupId) < 3) {
        items.push({
          label: t("groups.newChild"),
          onSelect: () => api.promptCreateGroup(group.workspaceId, groupId),
        });
      }
      items.push(
        {
          label: t("common.rename"),
          onSelect: () => api.promptRenameGroup(groupId),
        },
        {
          label: t("groups.deleteGroup"),
          danger: true,
          onSelect: () => api.promptDeleteGroup(groupId),
        },
      );
      showMenu(anchor, items);
    },

    showSessionMenu(anchor, sessionId, groupId) {
      showMenu(anchor, [
        { label: t("common.open"), onSelect: () => api.openSession(sessionId) },
        {
          label: t("groups.moveSession"),
          onSelect: () => api.pickGroupForSession(sessionId),
        },
        {
          label: t("groups.removeSession"),
          onSelect: () => api.removeSessionFromGroup(groupId, sessionId),
        },
        {
          label:
            state.highlights[sessionId] === undefined
              ? t("menu.highlight")
              : t("menu.unhighlight"),
          onSelect: () => api.toggleHighlight(sessionId),
        },
      ]);
    },

    recordFork(childId, parentId, atSeq, turn) {
      if (typeof childId !== "string" || typeof parentId !== "string") return;
      commit({
        forks: {
          ...state.forks,
          [childId]: {
            parentId,
            atSeq: Number.isSafeInteger(atSeq) ? atSeq : null,
            turn: Number.isSafeInteger(turn) ? turn : null,
            createdAt: Date.now(),
          },
        },
      });
    },
  };
  return api;
}

export { makeActions };
