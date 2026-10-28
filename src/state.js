/** Persistent sidebar state: highlights, session groups, and fork metadata. */
import { useSyncExternalStore } from "react";
import { STORAGE_KEY } from "./runtime.js";
function normalizeState(raw) {
  const base = {
    rev: 0,
    highlights: {},
    groups: [],
    forks: {},
    toast: null,
  };
  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
    return base;
  const highlights = {};
  if (
    raw.highlights !== null &&
    typeof raw.highlights === "object" &&
    !Array.isArray(raw.highlights)
  ) {
    for (const [id, value] of Object.entries(raw.highlights)) {
      if (typeof id === "string" && id !== "") {
        highlights[id] = {
          at: typeof value?.at === "number" ? value.at : Date.now(),
        };
      }
    }
  }
  const groups = [];
  if (Array.isArray(raw.groups)) {
    for (const group of raw.groups) {
      if (group === null || typeof group !== "object") continue;
      const workspaceId =
        typeof group.workspaceId === "string" ? group.workspaceId : "";
      if (workspaceId === "") continue;
      const id =
        typeof group.id === "string" && group.id !== ""
          ? group.id
          : uid("group");
      const name = typeof group.name === "string" ? group.name.trim() : "";
      if (name === "") continue;
      const sessionIds = Array.isArray(group.sessionIds)
        ? [
            ...new Set(
              group.sessionIds.filter(
                (value) => typeof value === "string" && value !== "",
              ),
            ),
          ]
        : [];
      groups.push({
        id,
        workspaceId,
        parentId:
          typeof group.parentId === "string" && group.parentId !== ""
            ? group.parentId
            : null,
        name,
        sessionIds,
        expanded: group.expanded !== false,
        createdAt:
          typeof group.createdAt === "number" ? group.createdAt : Date.now(),
      });
    }
  }
  // Workspace-scoped parent integrity: drop cross-workspace or cyclic
  // parents, and demote anything that would exceed three levels.
  const groupById = new Map(groups.map((group) => [group.id, group]));
  for (const group of groups) {
    if (group.parentId === null) continue;
    const parent = groupById.get(group.parentId);
    if (parent === undefined || parent.workspaceId !== group.workspaceId) {
      group.parentId = null;
      continue;
    }
    let depth = 1;
    let cursor = parent;
    const seen = new Set([group.id]);
    while (cursor !== undefined) {
      if (seen.has(cursor.id)) {
        group.parentId = null;
        depth = 99;
        break;
      }
      seen.add(cursor.id);
      depth += 1;
      if (depth > 3) break;
      cursor =
        cursor.parentId === null ? undefined : groupById.get(cursor.parentId);
    }
    if (depth > 3) group.parentId = null;
  }
  // A session belongs to at most one group in its workspace.
  const assigned = new Set();
  for (const group of groups.sort(
    (left, right) => left.createdAt - right.createdAt,
  )) {
    group.sessionIds = group.sessionIds.filter((sessionId) => {
      if (assigned.has(sessionId)) return false;
      assigned.add(sessionId);
      return true;
    });
  }
  const forks = {};
  if (
    raw.forks !== null &&
    typeof raw.forks === "object" &&
    !Array.isArray(raw.forks)
  ) {
    for (const [childId, value] of Object.entries(raw.forks)) {
      if (typeof childId !== "string" || childId === "") continue;
      if (value === null || typeof value !== "object") continue;
      if (typeof value.parentId !== "string" || value.parentId === "") continue;
      forks[childId] = {
        parentId: value.parentId,
        atSeq: Number.isSafeInteger(value.atSeq) ? value.atSeq : null,
        turn: Number.isSafeInteger(value.turn) ? value.turn : null,
        createdAt:
          typeof value.createdAt === "number" ? value.createdAt : Date.now(),
      };
    }
  }
  return {
    ...base,
    highlights,
    groups,
    forks,
    rev: typeof raw.rev === "number" ? raw.rev : 0,
  };
}

function loadState() {
  try {
    const text = globalThis.localStorage?.getItem(STORAGE_KEY);
    return text === null || text === undefined
      ? normalizeState(null)
      : normalizeState(JSON.parse(text));
  } catch {
    return normalizeState(null);
  }
}

function uid(prefix) {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

let state = loadState();
const listeners = new Set();

function persist() {
  try {
    const saved = {
      highlights: state.highlights,
      groups: state.groups,
      forks: state.forks,
    };
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage may be unavailable in private or embedded contexts.
  }
}

function commit(patch, options = {}) {
  state = { ...state, ...patch, rev: state.rev + 1 };
  if (options.persist !== false) persist();
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // A broken subscriber must not break the store.
    }
  }
}

const store = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
};

function useHandy() {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}

export { state, store, commit, useHandy, uid, normalizeState, loadState };
