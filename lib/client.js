window.__ModuleLoader__.load({
  id: "dsh-handy",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);

// src/runtime.js
var import_react = __toESM(require("react"), 1);
var ReactDOMNamespace = __toESM(require("react-dom"), 1);
var import_client = require("react-dom/client");
var primitivesNamespace = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);
var NS = "handy";
var STORAGE_KEY2 = "dsh.handy.v1";
var h = import_react.default.createElement;
var {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} = import_react.default;
var primitives = primitivesNamespace;
var ReactDOM = ReactDOMNamespace;
var ReactDOMClient = { createRoot: import_client.createRoot };
var handyT = (key) => key;
function setHandyT(translate) {
  handyT = translate;
}

// src/state.js
var import_react2 = require("react");
function normalizeState(raw) {
  const base = {
    rev: 0,
    highlights: {},
    groups: [],
    forks: {},
    notebooks: {},
    keyInfo: {},
    toast: null
  };
  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
    return base;
  const highlights = {};
  if (raw.highlights !== null && typeof raw.highlights === "object" && !Array.isArray(raw.highlights)) {
    for (const [id, value] of Object.entries(raw.highlights)) {
      if (typeof id === "string" && id !== "") {
        highlights[id] = {
          at: typeof value?.at === "number" ? value.at : Date.now()
        };
      }
    }
  }
  const groups = [];
  if (Array.isArray(raw.groups)) {
    for (const group of raw.groups) {
      if (group === null || typeof group !== "object") continue;
      const workspaceId = typeof group.workspaceId === "string" ? group.workspaceId : "";
      if (workspaceId === "") continue;
      const id = typeof group.id === "string" && group.id !== "" ? group.id : uid("group");
      const name2 = typeof group.name === "string" ? group.name.trim() : "";
      if (name2 === "") continue;
      const sessionIds = Array.isArray(group.sessionIds) ? [
        ...new Set(
          group.sessionIds.filter(
            (value) => typeof value === "string" && value !== ""
          )
        )
      ] : [];
      groups.push({
        id,
        workspaceId,
        parentId: typeof group.parentId === "string" && group.parentId !== "" ? group.parentId : null,
        name: name2,
        sessionIds,
        expanded: group.expanded !== false,
        createdAt: typeof group.createdAt === "number" ? group.createdAt : Date.now()
      });
    }
  }
  const groupById = new Map(groups.map((group) => [group.id, group]));
  for (const group of groups) {
    if (group.parentId === null) continue;
    const parent = groupById.get(group.parentId);
    if (parent === void 0 || parent.workspaceId !== group.workspaceId) {
      group.parentId = null;
      continue;
    }
    let depth = 1;
    let cursor = parent;
    const seen = /* @__PURE__ */ new Set([group.id]);
    while (cursor !== void 0) {
      if (seen.has(cursor.id)) {
        group.parentId = null;
        depth = 99;
        break;
      }
      seen.add(cursor.id);
      depth += 1;
      if (depth > 3) break;
      cursor = cursor.parentId === null ? void 0 : groupById.get(cursor.parentId);
    }
    if (depth > 3) group.parentId = null;
  }
  const assigned = /* @__PURE__ */ new Set();
  for (const group of groups.sort(
    (left, right) => left.createdAt - right.createdAt
  )) {
    group.sessionIds = group.sessionIds.filter((sessionId) => {
      if (assigned.has(sessionId)) return false;
      assigned.add(sessionId);
      return true;
    });
  }
  const notebooks = {};
  if (raw.notebooks !== null && typeof raw.notebooks === "object" && !Array.isArray(raw.notebooks)) {
    for (const [sessionId, value] of Object.entries(raw.notebooks)) {
      if (typeof sessionId !== "string" || sessionId === "") continue;
      if (typeof value === "string" && value !== "")
        notebooks[sessionId] = value;
    }
  }
  const keyInfo = {};
  if (raw.keyInfo !== null && typeof raw.keyInfo === "object" && !Array.isArray(raw.keyInfo)) {
    for (const [sessionId, value] of Object.entries(raw.keyInfo)) {
      if (typeof sessionId !== "string" || sessionId === "") continue;
      if (value === null || typeof value !== "object") continue;
      const items = [];
      if (Array.isArray(value.items)) {
        for (const item of value.items) {
          if (item === null || typeof item !== "object") continue;
          items.push({
            id: typeof item.id === "string" && item.id !== "" ? item.id : uid("key"),
            name: typeof item.name === "string" ? item.name : "",
            value: typeof item.value === "string" ? item.value : "",
            note: typeof item.note === "string" ? item.note : "",
            collapsed: item.collapsed === true
          });
        }
      }
      keyInfo[sessionId] = {
        collapsed: value.collapsed !== false,
        items,
        panel: {
          right: Number.isFinite(value.panel?.right) && value.panel.right >= 0 ? value.panel.right : 16,
          top: Number.isFinite(value.panel?.top) && value.panel.top >= 0 ? value.panel.top : 88
        }
      };
    }
  }
  const forks = {};
  if (raw.forks !== null && typeof raw.forks === "object" && !Array.isArray(raw.forks)) {
    for (const [childId, value] of Object.entries(raw.forks)) {
      if (typeof childId !== "string" || childId === "") continue;
      if (value === null || typeof value !== "object") continue;
      if (typeof value.parentId !== "string" || value.parentId === "") continue;
      forks[childId] = {
        parentId: value.parentId,
        atSeq: Number.isSafeInteger(value.atSeq) ? value.atSeq : null,
        turn: Number.isSafeInteger(value.turn) ? value.turn : null,
        createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now()
      };
    }
  }
  return {
    ...base,
    highlights,
    groups,
    forks,
    notebooks,
    keyInfo,
    rev: typeof raw.rev === "number" ? raw.rev : 0
  };
}
function loadState() {
  try {
    const text = globalThis.localStorage?.getItem(STORAGE_KEY2);
    return text === null || text === void 0 ? normalizeState(null) : normalizeState(JSON.parse(text));
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
var state = loadState();
var listeners = /* @__PURE__ */ new Set();
function persist() {
  try {
    const saved = {
      highlights: state.highlights,
      groups: state.groups,
      forks: state.forks,
      notebooks: state.notebooks,
      keyInfo: state.keyInfo
    };
    globalThis.localStorage?.setItem(STORAGE_KEY2, JSON.stringify(saved));
  } catch {
  }
}
function commit(patch, options = {}) {
  state = { ...state, ...patch, rev: state.rev + 1 };
  if (options.persist !== false) persist();
  for (const listener of listeners) {
    try {
      listener();
    } catch {
    }
  }
}
var store = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  }
};
function useHandy() {
  return (0, import_react2.useSyncExternalStore)(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}

// src/i18n.js
var zh = {
  common: {
    current: "\u5F53\u524D\u4F1A\u8BDD",
    all: "\u5168\u90E8\u4F1A\u8BDD",
    cancel: "\u53D6\u6D88",
    close: "\u5173\u95ED",
    copy: "\u590D\u5236",
    copied: "\u5DF2\u590D\u5236",
    delete: "\u5220\u9664",
    open: "\u6253\u5F00",
    rename: "\u91CD\u547D\u540D",
    save: "\u4FDD\u5B58",
    search: "\u641C\u7D22",
    noSession: "\u672A\u9009\u62E9\u4F1A\u8BDD",
    untitled: "\u672A\u547D\u540D\u4F1A\u8BDD",
    sessions: "\u4E2A\u4F1A\u8BDD",
    turn: "\u7B2C {n} \u8F6E",
    loading: "\u52A0\u8F7D\u4E2D\u2026",
    retry: "\u91CD\u8BD5"
  },
  groups: {
    action: "\u65B0\u589E\u4F1A\u8BDD\u7EC4",
    createTitle: "\u65B0\u589E\u4F1A\u8BDD\u7EC4",
    createChildTitle: "\u65B0\u589E\u5B50\u4F1A\u8BDD\u7EC4",
    createDescription: "\u4F1A\u8BDD\u7EC4\u53EA\u5B58\u5728\u4E8E\u5F53\u524D\u5DE5\u4F5C\u533A\uFF0C\u6700\u591A\u5D4C\u5957 3 \u7EA7\u3002",
    createChildDescription: "\u5728\u300C{name}\u300D\u4E0B\u65B0\u5EFA\u5B50\u4F1A\u8BDD\u7EC4\u3002",
    namePlaceholder: "\u4F1A\u8BDD\u7EC4\u540D\u79F0\uFF0C\u4F8B\u5982\uFF1A\u652F\u4ED8\u6539\u9020",
    create: "\u521B\u5EFA",
    createAndAdd: "\u65B0\u5EFA\u5E76\u52A0\u5165",
    pickGroup: "\u52A0\u5165\u4F1A\u8BDD\u7EC4",
    pickGroupDescription: "\u9009\u62E9\u5F53\u524D\u5DE5\u4F5C\u533A\u4E0B\u7684\u4F1A\u8BDD\u7EC4\uFF0C\u4E5F\u53EF\u4EE5\u65B0\u5EFA\u5E76\u52A0\u5165\u3002",
    pickSessionTitle: "\u6DFB\u52A0\u4F1A\u8BDD\u5230\u4F1A\u8BDD\u7EC4",
    addSession: "\u6DFB\u52A0\u4F1A\u8BDD\u5230\u4F1A\u8BDD\u7EC4",
    addSessionTitle: "\u6DFB\u52A0\u4F1A\u8BDD",
    addSessionDescription: "\u9009\u62E9\u8981\u79FB\u5165\u300C{name}\u300D\u7684\u4F1A\u8BDD\u3002",
    newSession: "\u521B\u5EFA\u4F1A\u8BDD",
    newChild: "\u65B0\u5EFA\u5B50\u4F1A\u8BDD\u7EC4",
    deleteGroup: "\u5220\u9664\u4F1A\u8BDD\u7EC4",
    deleteTitle: "\u5220\u9664\u4F1A\u8BDD\u7EC4\uFF1F",
    deleteDescription: "\u53EA\u4F1A\u5220\u9664\u4F1A\u8BDD\u7EC4\uFF0C\u4E0D\u4F1A\u5220\u9664\u4F1A\u8BDD\uFF1B\u7EC4\u5185\u4F1A\u8BDD\u4F1A\u79FB\u5230\u4E0A\u4E00\u5C42\u6216\u672A\u5206\u7EC4\u3002",
    deleteNestedDescription: "\u300C{name}\u300D\u53CA {n} \u4E2A\u5B50\u7EC4\u4F1A\u88AB\u5220\u9664\uFF1B\u7EC4\u5185\u4F1A\u8BDD\u4F1A\u79FB\u5230\u4E0A\u4E00\u5C42\u6216\u672A\u5206\u7EC4\u3002",
    renameTitle: "\u91CD\u547D\u540D\u4F1A\u8BDD\u7EC4",
    moveSession: "\u79FB\u52A8\u5230\u5176\u4ED6\u4F1A\u8BDD\u7EC4",
    removeSession: "\u79FB\u51FA\u4F1A\u8BDD\u7EC4",
    sessionCount: "{n} \u4E2A\u4F1A\u8BDD",
    emptyName: "\u4F1A\u8BDD\u7EC4\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002",
    duplicate: "\u540C\u4E00\u5C42\u5DF2\u5B58\u5728\u540C\u540D\u4F1A\u8BDD\u7EC4\u3002",
    depthLimit: "\u4F1A\u8BDD\u7EC4\u6700\u591A\u5D4C\u5957 3 \u7EA7\u3002",
    crossWorkspace: "\u4F1A\u8BDD\u4E0E\u4F1A\u8BDD\u7EC4\u5FC5\u987B\u5C5E\u4E8E\u540C\u4E00\u5DE5\u4F5C\u533A\u3002",
    noWorkspace: "\u5F53\u524D\u4F1A\u8BDD\u4E0D\u5728\u4EFB\u4F55\u5DE5\u4F5C\u533A\u4E2D\u3002",
    noUngroupedSessions: "\u5F53\u524D\u5DE5\u4F5C\u533A\u6CA1\u6709\u53EF\u6DFB\u52A0\u7684\u4F1A\u8BDD\u3002",
    createSessionFailed: "\u521B\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A{message}",
    groupMenu: "\u4F1A\u8BDD\u7EC4\u64CD\u4F5C",
    sessionMenu: "\u4F1A\u8BDD\u64CD\u4F5C",
    count: "{n}"
  },
  notebook: {
    tab: "\u7B14\u8BB0\u672C",
    title: "\u4F1A\u8BDD\u7B14\u8BB0\u672C",
    hint: "\u4EC5\u4FDD\u5B58\u5728\u672C\u673A\u6D4F\u89C8\u5668\uFF0C\u968F\u5F53\u524D\u4F1A\u8BDD\u4FDD\u7559",
    placeholder: "\u8BB0\u5F55\u5F53\u524D\u4F1A\u8BDD\u7684\u5173\u952E\u80CC\u666F\u3001\u5224\u65AD\u3001\u5F85\u529E\uFF0C\u6216\u7C98\u8D34\u9700\u8981\u53CD\u590D\u67E5\u770B\u7684\u7247\u6BB5\u2026",
    chars: "{n} \u5B57",
    clear: "\u6E05\u7A7A",
    copy: "\u590D\u5236",
    saved: "\u81EA\u52A8\u4FDD\u5B58\u5728\u672C\u673A"
  },
  keyInfo: {
    title: "\u5173\u952E\u4FE1\u606F",
    badge: "\u5173\u952E\u4FE1\u606F",
    show: "\u5C55\u5F00\u5173\u952E\u4FE1\u606F",
    hide: "\u9690\u85CF\u5173\u952E\u4FE1\u606F",
    count: "{n} \u9879",
    empty: "\u8FD8\u6CA1\u6709\u5173\u952E\u4FE1\u606F\u3002\u6DFB\u52A0\u76EE\u6807\u5730\u5740\u3001\u8D26\u53F7\u6216\u5907\u6CE8\uFF0C\u6CE8\u5165\u65F6\u4F1A\u4E00\u5E76\u53D1\u9001\u3002",
    add: "\u6DFB\u52A0\u6761\u76EE",
    addPreset: "\u5FEB\u901F\u6DFB\u52A0",
    presetTarget: "\u76EE\u6807\u5730\u5740",
    presetTargetNote: "\u76EE\u6807 IP / \u57DF\u540D / \u7AEF\u53E3",
    presetSsh: "SSH \u8D26\u5BC6",
    presetSshNote: "\u7528\u6237\u540D / \u5BC6\u7801 / \u7AEF\u53E3",
    presetWeb: "Web \u8D26\u5BC6",
    presetWebNote: "\u767B\u5F55\u5730\u5740 / \u7528\u6237\u540D / \u5BC6\u7801",
    presetDb: "\u6570\u636E\u5E93\u8D26\u5BC6",
    presetDbNote: "\u7C7B\u578B / \u5730\u5740 / \u7528\u6237\u540D / \u5BC6\u7801",
    namePlaceholder: "\u9879\u76EE\uFF0C\u5982 \u76EE\u6807\u5730\u5740",
    valuePlaceholder: "\u503C\uFF0C\u5982 10.0.0.5",
    notePlaceholder: "\u8BF4\u660E\uFF08\u53EF\u9009\uFF09",
    copy: "\u590D\u5236",
    remove: "\u5220\u9664",
    collapse: "\u6298\u53E0\u6761\u76EE",
    expand: "\u5C55\u5F00\u6761\u76EE",
    collapseAll: "\u5168\u90E8\u6298\u53E0",
    expandAll: "\u5168\u90E8\u5C55\u5F00",
    inject: "\u518D\u6B21\u6CE8\u5165",
    injecting: "\u6CE8\u5165\u4E2D\u2026",
    localOnly: "\u9ED8\u8BA4\u4EC5\u5B58\u672C\u673A\uFF0C\u6CE8\u5165\u65F6\u53D1\u9001\u5230\u5F53\u524D\u4F1A\u8BDD",
    noItems: "\u6CA1\u6709\u53EF\u6CE8\u5165\u7684\u5173\u952E\u4FE1\u606F\u3002",
    noSession: "\u5F53\u524D\u4F1A\u8BDD\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6CE8\u5165\u3002",
    sessionInUse: "\u5F53\u524D\u4F1A\u8BDD\u88AB\u53E6\u4E00\u4E2A DSH \u8FDB\u7A0B\u5360\u7528\uFF0C\u65E0\u6CD5\u6CE8\u5165\u3002",
    untitled: "\u672A\u547D\u540D",
    injectPreamble: "\u4EE5\u4E0B\u662F\u6211\u8865\u5145\u7684\u5F53\u524D\u4F1A\u8BDD\u5173\u952E\u4FE1\u606F\uFF0C\u8BF7\u5728\u540E\u7EED\u5206\u6790\u3001\u5224\u65AD\u548C\u64CD\u4F5C\u4E2D\u4F18\u5148\u53C2\u8003\u3002\u8FD9\u4E9B\u4FE1\u606F\u7531\u6211\u624B\u52A8\u7EF4\u62A4\uFF0C\u53EF\u80FD\u5305\u542B\u654F\u611F\u51ED\u636E\uFF0C\u4EC5\u9650\u5F53\u524D\u6388\u6743\u73AF\u5883\u4F7F\u7528\uFF0C\u4E0D\u8981\u4E3B\u52A8\u6269\u6563\u3002",
    injectItem: "- {name}\uFF1A{value}",
    injectNote: "  \u8BF4\u660E\uFF1A{note}"
  },
  row: {
    highlight: "\u6807\u8BB0\u4E3A\u91CD\u8981\u4F1A\u8BDD",
    unhighlight: "\u53D6\u6D88\u91CD\u8981\u6807\u8BB0",
    important: "\u91CD\u8981\u4F1A\u8BDD"
  },
  menu: {
    highlight: "\u6807\u8BB0\u4E3A\u91CD\u8981",
    unhighlight: "\u53D6\u6D88\u91CD\u8981\u6807\u8BB0",
    addGroup: "\u52A0\u5165\u4F1A\u8BDD\u7EC4\u2026",
    separator: "\u5FEB\u6377\u64CD\u4F5C"
  },
  file: {
    closeCurrent: "\u5173\u95ED\u5F53\u524D\u6807\u7B7E\u9875",
    closeLeft: "\u5173\u95ED\u5DE6\u4FA7\u6240\u6709\u6807\u7B7E\u9875",
    closeRight: "\u5173\u95ED\u53F3\u4FA7\u6240\u6709\u6807\u7B7E\u9875",
    closeAll: "\u5173\u95ED\u6240\u6709\u6807\u7B7E\u9875"
  },
  fork: {
    title: "\u4ECE\u6307\u5B9A\u8F6E\u6B21\u5206\u53C9",
    description: "\u9009\u62E9\u4E00\u8F6E\u7528\u6237\u8F93\u5165\uFF0C\u4ECE\u8BE5\u8F6E\u5B8C\u6574\u5BF9\u8BDD\u4E4B\u540E\u521B\u5EFA\u65B0\u5206\u652F",
    group: "\u7528\u6237\u8F6E\u6B21",
    search: "\u641C\u7D22\u8F6E\u6B21\u5185\u5BB9\u2026",
    empty: "\u5F53\u524D\u4F1A\u8BDD\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u7528\u6237\u8F6E\u6B21\uFF0C\u6682\u65F6\u65E0\u6CD5\u5206\u53C9\u3002",
    noResults: "\u6CA1\u6709\u5339\u914D\u7684\u8F6E\u6B21\u3002",
    option: "\u7B2C {n} \u8F6E",
    optionDetail: "{time} \xB7 \u5B8C\u6574\u8F6E\u6B21",
    optionRunning: "{time} \xB7 \u8FDB\u884C\u4E2D\uFF0C\u4ECE\u5F53\u524D\u8FDB\u5EA6\u5206\u53C9",
    pending: "\u6B63\u5728\u521B\u5EFA\u5206\u652F\u2026",
    created: "\u5DF2\u4ECE\u7B2C {n} \u8F6E\u521B\u5EFA\u5206\u652F",
    failed: "\u5206\u53C9\u5931\u8D25\uFF1A{message}",
    openChild: "\u5DF2\u6253\u5F00\u65B0\u5206\u652F",
    turnEmpty: "\uFF08\u65E0\u6587\u672C\u8F93\u5165\uFF09"
  },
  cmd: {
    fork: "\u4ECE\u6307\u5B9A\u8F6E\u6B21\u5206\u53C9"
  },
  toast: {
    forkCreated: "\u5DF2\u4ECE\u7B2C {n} \u8F6E\u521B\u5EFA\u5206\u652F",
    forkOpened: "\u5DF2\u6253\u5F00\u65B0\u5206\u652F",
    forkFailed: "\u5206\u53C9\u5931\u8D25\uFF1A{message}",
    groupAdded: "\u5DF2\u52A0\u5165\u300C{name}\u300D",
    groupRemoved: "\u5DF2\u79FB\u51FA\u4F1A\u8BDD\u7EC4",
    groupCreated: "\u5DF2\u521B\u5EFA\u4F1A\u8BDD\u7EC4\u300C{name}\u300D",
    groupDeleted: "\u5DF2\u5220\u9664\u4F1A\u8BDD\u7EC4",
    highlightOn: "\u5DF2\u6807\u8BB0\u4E3A\u91CD\u8981\u4F1A\u8BDD",
    highlightOff: "\u5DF2\u53D6\u6D88\u91CD\u8981\u6807\u8BB0",
    copied: "\u5DF2\u590D\u5236",
    copyFailed: "\u590D\u5236\u5931\u8D25",
    notebookCleared: "\u7B14\u8BB0\u672C\u5DF2\u6E05\u7A7A",
    keyInfoInjected: "\u5173\u952E\u4FE1\u606F\u5DF2\u6CE8\u5165\u5230\u4F1A\u8BDD\u672B\u5C3E",
    keyInfoFailed: "\u6CE8\u5165\u5931\u8D25\uFF1A{message}"
  }
};
var en = {
  common: {
    current: "Current session",
    all: "All sessions",
    cancel: "Cancel",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    delete: "Delete",
    open: "Open",
    rename: "Rename",
    save: "Save",
    search: "Search",
    noSession: "No session selected",
    untitled: "Untitled session",
    sessions: "sessions",
    turn: "Turn {n}",
    loading: "Loading\u2026",
    retry: "Retry"
  },
  groups: {
    action: "New session group",
    createTitle: "New session group",
    createChildTitle: "New child group",
    createDescription: "A group belongs to the current workspace and nests at most three levels.",
    createChildDescription: "Create a child group under \u201C{name}\u201D.",
    namePlaceholder: "Group name, e.g. Payments refactor",
    create: "Create",
    createAndAdd: "Create and add",
    pickGroup: "Add to session group",
    pickGroupDescription: "Pick a group in the current workspace, or create one and add the session.",
    pickSessionTitle: "Add a session to this group",
    addSession: "Add session to group",
    addSessionTitle: "Add session",
    addSessionDescription: "Choose a session to move into \u201C{name}\u201D.",
    newSession: "Create session",
    newChild: "New child group",
    deleteGroup: "Delete session group",
    deleteTitle: "Delete session group?",
    deleteDescription: "Only the group is removed. Its sessions move up one level or become ungrouped.",
    deleteNestedDescription: "\u201C{name}\u201D and {n} child groups will be removed. Their sessions move up one level or become ungrouped.",
    renameTitle: "Rename session group",
    moveSession: "Move to another group",
    removeSession: "Remove from group",
    sessionCount: "{n} sessions",
    emptyName: "Group name cannot be empty.",
    duplicate: "A group with that name already exists at this level.",
    depthLimit: "Session groups nest at most three levels.",
    crossWorkspace: "A session and its group must belong to the same workspace.",
    noWorkspace: "This session is not in any workspace.",
    noUngroupedSessions: "This workspace has no sessions available to add.",
    createSessionFailed: "Could not create the session: {message}",
    groupMenu: "Group actions",
    sessionMenu: "Session actions",
    count: "{n}"
  },
  notebook: {
    tab: "Notebook",
    title: "Session notebook",
    hint: "Stored only in this browser and kept per session",
    placeholder: "Capture key context, decisions, follow-ups, or snippets you need to revisit\u2026",
    chars: "{n} chars",
    clear: "Clear",
    copy: "Copy",
    saved: "Auto-saved locally"
  },
  keyInfo: {
    title: "Key information",
    badge: "Key info",
    show: "Expand key information",
    hide: "Hide key information",
    count: "{n} items",
    empty: "No key information yet. Add targets, accounts, or notes and send them together when injecting.",
    add: "Add item",
    addPreset: "Quick add",
    presetTarget: "Target",
    presetTargetNote: "IP / hostname / port",
    presetSsh: "SSH credentials",
    presetSshNote: "Username / password / port",
    presetWeb: "Web credentials",
    presetWebNote: "Login URL / username / password",
    presetDb: "Database credentials",
    presetDbNote: "Type / host / username / password",
    namePlaceholder: "Item, e.g. Target address",
    valuePlaceholder: "Value, e.g. 10.0.0.5",
    notePlaceholder: "Note (optional)",
    copy: "Copy",
    remove: "Delete",
    collapse: "Collapse item",
    expand: "Expand item",
    collapseAll: "Collapse all",
    expandAll: "Expand all",
    inject: "Inject again",
    injecting: "Injecting\u2026",
    localOnly: "Stored locally; sent only when injected",
    noItems: "There is no key information to inject.",
    noSession: "The current session is unavailable for injection.",
    sessionInUse: "The session is owned by another DSH process and cannot be injected into.",
    untitled: "Untitled",
    injectPreamble: "These are key details I maintain for the current session. Prefer them in later analysis, decisions, and operations. They may contain credentials and are intended only for this authorized environment; do not spread them elsewhere.",
    injectItem: "- {name}: {value}",
    injectNote: "  Note: {note}"
  },
  row: {
    highlight: "Mark as important",
    unhighlight: "Remove important mark",
    important: "Important session"
  },
  menu: {
    highlight: "Mark as important",
    unhighlight: "Remove important mark",
    addGroup: "Add to session group\u2026",
    separator: "Quick actions"
  },
  file: {
    closeCurrent: "Close current tab",
    closeLeft: "Close all tabs to the left",
    closeRight: "Close all tabs to the right",
    closeAll: "Close all tabs"
  },
  fork: {
    title: "Fork from a turn",
    description: "Pick a user turn and branch after that complete exchange",
    group: "User turns",
    search: "Search turn text\u2026",
    empty: "This session has no user turns to fork from yet.",
    noResults: "No matching turns.",
    option: "Turn {n}",
    optionDetail: "{time} \xB7 complete turn",
    optionRunning: "{time} \xB7 in progress, branches from current point",
    pending: "Creating branch\u2026",
    created: "Created a branch from turn {n}",
    failed: "Fork failed: {message}",
    openChild: "Opened the new branch",
    turnEmpty: "(no text input)"
  },
  cmd: {
    fork: "Fork from a turn"
  },
  toast: {
    forkCreated: "Created a branch from turn {n}",
    forkOpened: "Opened the new branch",
    forkFailed: "Fork failed: {message}",
    groupAdded: "Added to \u201C{name}\u201D",
    groupRemoved: "Removed from session group",
    groupCreated: "Created session group \u201C{name}\u201D",
    groupDeleted: "Session group deleted",
    highlightOn: "Marked as important",
    highlightOff: "Important mark removed",
    copied: "Copied",
    copyFailed: "Copy failed",
    notebookCleared: "Notebook cleared",
    keyInfoInjected: "Key information injected at the end of the session",
    keyInfoFailed: "Injection failed: {message}"
  }
};
function flattenMessages(source, prefix = "", target = {}) {
  for (const [key, value] of Object.entries(source)) {
    const flatKey = prefix === "" ? key : `${prefix}.${key}`;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenMessages(value, flatKey, target);
    } else {
      target[flatKey] = String(value);
    }
  }
  return target;
}
var zhMessages = flattenMessages(zh);
var enMessages = flattenMessages(en);
function fmt(t, key, vars) {
  let value = t(key);
  if (vars === void 0) return value;
  for (const [name2, replacement] of Object.entries(vars)) {
    value = String(value).split(`{${name2}}`).join(String(replacement));
  }
  return value;
}

// src/overlays.js
var draggedSession2 = null;
function startSessionDrag(event, sessionId, workspaceId) {
  if (typeof sessionId !== "string" || typeof workspaceId !== "string") {
    event.preventDefault();
    return;
  }
  draggedSession2 = { sessionId, workspaceId };
  const transfer = event.dataTransfer;
  if (transfer !== null && transfer !== void 0) {
    try {
      transfer.effectAllowed = "move";
      transfer.setData("application/x-dsh-handy-session", sessionId);
      transfer.setData("text/plain", sessionId);
    } catch {
    }
  }
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setAttribute("data-handy-dragging", "true");
  }
}
function endSessionDrag() {
  draggedSession2 = null;
  if (typeof document === "undefined") return;
  for (const node of document.querySelectorAll(
    "[data-handy-dragging], [data-handy-drop]"
  )) {
    node.removeAttribute("data-handy-dragging");
    node.removeAttribute("data-handy-drop");
  }
}
var activeMenu = null;
function closeActiveMenu() {
  if (activeMenu === null) return;
  const current = activeMenu;
  activeMenu = null;
  current.cleanup();
  current.element.remove();
}
function showMenu(anchor, items) {
  if (typeof document === "undefined" || anchor === null || anchor === void 0)
    return;
  closeActiveMenu();
  const menu = document.createElement("div");
  menu.className = "hy-menu";
  menu.setAttribute("data-handy-menu", "true");
  menu.setAttribute("role", "menu");
  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hy-menu-item";
    button.setAttribute("role", "menuitem");
    if (item.danger === true) button.setAttribute("data-danger", "true");
    button.textContent = item.label;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeActiveMenu();
      item.onSelect?.();
    });
    menu.appendChild(button);
  }
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const left = Math.max(
    8,
    Math.min(window.innerWidth - width - 8, rect.right - width)
  );
  const top = rect.bottom + 6 + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : rect.bottom + 6;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  const onPointerDown = (event) => {
    if (event.target instanceof Node && menu.contains(event.target)) return;
    closeActiveMenu();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeActiveMenu();
    }
  };
  const onScroll = () => closeActiveMenu();
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("resize", onScroll);
  window.addEventListener("scroll", onScroll, true);
  activeMenu = {
    element: menu,
    cleanup() {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    }
  };
}
function openModal({
  title,
  description,
  body,
  confirmLabel,
  onConfirm,
  danger = false,
  validate
}) {
  if (typeof document === "undefined") return;
  const backdrop = document.createElement("div");
  backdrop.className = "hy-modal-backdrop";
  backdrop.setAttribute("data-handy-modal", "true");
  const panel = document.createElement("div");
  panel.className = "hy-modal";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", title);
  const heading = document.createElement("h2");
  heading.className = "hy-modal-title";
  heading.textContent = title;
  panel.appendChild(heading);
  if (description !== void 0 && description !== "") {
    const copy = document.createElement("div");
    copy.className = "hy-modal-desc";
    copy.textContent = description;
    panel.appendChild(copy);
  }
  if (body !== void 0) panel.appendChild(body);
  const error = document.createElement("div");
  error.className = "hy-modal-error";
  panel.appendChild(error);
  const actions = document.createElement("div");
  actions.className = "hy-modal-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "hy-btn";
  cancel.textContent = handyT("common.cancel");
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = danger ? "hy-btn hy-btn-danger-text" : "hy-btn hy-btn-primary";
  confirm.textContent = confirmLabel;
  actions.append(cancel, confirm);
  panel.appendChild(actions);
  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);
  const close = () => {
    document.removeEventListener("keydown", onKeyDown, true);
    backdrop.remove();
  };
  const submit = () => {
    const problem = validate?.();
    if (problem !== void 0 && problem !== "") {
      error.textContent = problem;
      return;
    }
    close();
    onConfirm?.();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "Enter" && event.target instanceof HTMLElement && event.target.tagName === "INPUT") {
      event.preventDefault();
      submit();
    }
  };
  cancel.addEventListener("click", close);
  confirm.addEventListener("click", submit);
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", onKeyDown, true);
  globalThis.setTimeout(() => {
    panel.querySelector("input")?.focus();
    panel.querySelector("input")?.select?.();
  }, 0);
  return { close, panel, error };
}
function showTextDialog({
  title,
  description,
  placeholder,
  initialValue = "",
  confirmLabel,
  onConfirm
}) {
  const input = document.createElement("input");
  input.className = "hy-input";
  input.placeholder = placeholder ?? "";
  input.value = initialValue;
  const modal = openModal({
    title,
    description,
    body: input,
    confirmLabel,
    validate: () => input.value.trim() === "" ? handyT("groups.emptyName") : void 0,
    onConfirm: () => onConfirm(input.value.trim())
  });
  return modal;
}
function showConfirmDialog({
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm
}) {
  return openModal({ title, description, confirmLabel, danger, onConfirm });
}
function showChoiceDialog({ title, description, options, extra, onSelect }) {
  const list = document.createElement("div");
  list.className = "hy-modal-list";
  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hy-modal-option";
    const label = document.createElement("span");
    label.textContent = option.label;
    button.appendChild(label);
    if (option.detail !== void 0) {
      const detail = document.createElement("span");
      detail.className = "hy-modal-option-detail";
      detail.textContent = option.detail;
      button.appendChild(detail);
    }
    button.addEventListener("click", () => {
      modal.close();
      onSelect(option.value);
    });
    list.appendChild(button);
  }
  if (extra !== void 0) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hy-modal-option";
    button.style.color = "var(--hy-brand)";
    button.textContent = extra.label;
    button.addEventListener("click", () => {
      modal.close();
      onSelect(extra.value);
    });
    list.appendChild(button);
  }
  const modal = openModal({
    title,
    description,
    body: list,
    confirmLabel: handyT("common.cancel"),
    onConfirm: () => {
    }
  });
  const footer = modal.panel.querySelector(".hy-modal-actions");
  if (footer !== null) {
    footer.textContent = "";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "hy-btn";
    close.textContent = handyT("common.cancel");
    close.addEventListener("click", () => modal.close());
    footer.appendChild(close);
  }
  return modal;
}

// src/session.js
function currentSessionId(list) {
  if (list === null || typeof list !== "object") return void 0;
  return Object.values(list.byId ?? {}).find(
    (row) => (row.retainedBy?.mainView ?? 0) > 0
  )?.id;
}
function sessionTitle(summary, t) {
  const title = typeof summary?.displayTitle === "string" && summary.displayTitle.trim() !== "" ? summary.displayTitle.trim() : typeof summary?.title === "string" && summary.title.trim() !== "" ? summary.title.trim() : "";
  return title === "" ? t("common.untitled") : title;
}
function excerpt(text, max = 72) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean === "") return "";
  return clean.length > max ? `${clean.slice(0, max)}\u2026` : clean;
}
function formatTime(ms, locale) {
  if (!Number.isFinite(ms) || ms <= 0) return "\u2014";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en" : "zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}
function textOfContent(content) {
  if (!Array.isArray(content)) return "";
  const parts = [];
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    if (block.type === "text" && typeof block.text === "string" && block.text.trim() !== "") {
      parts.push(block.text);
    }
  }
  return parts.join("\n").trim();
}
function eventOf(entry) {
  if (entry === null || typeof entry !== "object") return void 0;
  return entry.event ?? entry;
}
function parseTurns(entries) {
  const events = [];
  for (const entry of entries ?? []) {
    const event = eventOf(entry);
    if (event === null || typeof event !== "object") continue;
    if (!Number.isSafeInteger(event.seq) || event.seq < 0) continue;
    events.push(event);
  }
  events.sort((left, right) => left.seq - right.seq);
  const turns = /* @__PURE__ */ new Map();
  let currentTurn = null;
  let pendingPrompts = [];
  let forkCut = null;
  const ensure = (number) => {
    let row = turns.get(number);
    if (row === void 0) {
      row = {
        turn: number,
        prompt: "",
        reply: "",
        startSeq: null,
        endSeq: null,
        lastSeq: null,
        completed: false,
        time: null
      };
      turns.set(number, row);
    }
    return row;
  };
  for (const event of events) {
    if (event.type === "session/end-seed" && event.data?.inherited === true && forkCut === null) {
      forkCut = event.seq > 0 ? event.seq - 1 : 0;
    }
    if (event.type === "user/message") {
      const source = event.data?.source;
      if (source !== void 0 && source !== null && source.kind !== "user")
        continue;
      const text = textOfContent(event.data?.content);
      if (text === "") continue;
      if (currentTurn !== null) {
        const row = ensure(currentTurn);
        row.prompt = row.prompt === "" ? text : `${row.prompt}
${text}`;
        row.time ?? (row.time = event.time);
        row.lastSeq = event.seq;
      } else {
        pendingPrompts.push({ text, time: event.time, seq: event.seq });
      }
      continue;
    }
    if (event.type === "turn/start") {
      const number = event.data?.turn;
      if (!Number.isSafeInteger(number) || number < 0) continue;
      currentTurn = number;
      const row = ensure(number);
      row.startSeq ?? (row.startSeq = event.seq);
      row.time ?? (row.time = event.time);
      if (pendingPrompts.length > 0) {
        row.prompt = pendingPrompts.map((item) => item.text).join("\n");
        row.time = pendingPrompts[0].time ?? row.time;
        row.lastSeq = Math.max(
          row.lastSeq ?? 0,
          ...pendingPrompts.map((item) => item.seq)
        );
        pendingPrompts = [];
      }
      continue;
    }
    if (event.type === "assistant/message") {
      const number = event.data?.turn;
      if (!Number.isSafeInteger(number) || number < 0) continue;
      const row = ensure(number);
      if (pendingPrompts.length > 0 && row.prompt === "") {
        row.prompt = pendingPrompts.map((item) => item.text).join("\n");
        row.time = pendingPrompts[0].time ?? row.time;
        row.lastSeq = Math.max(
          row.lastSeq ?? 0,
          ...pendingPrompts.map((item) => item.seq)
        );
        pendingPrompts = [];
      }
      const text = textOfContent(event.data?.message?.content);
      if (text !== "")
        row.reply = row.reply === "" ? text : `${row.reply}
${text}`;
      row.lastSeq = event.seq;
      row.time ?? (row.time = event.time);
      continue;
    }
    if (event.type === "turn/end") {
      const number = event.data?.turn;
      if (!Number.isSafeInteger(number) || number < 0) continue;
      const row = ensure(number);
      row.endSeq = event.seq;
      row.completed = true;
      row.lastSeq = event.seq;
      if (currentTurn === number) currentTurn = null;
    }
  }
  if (pendingPrompts.length > 0 && currentTurn !== null) {
    const row = ensure(currentTurn);
    row.prompt = [row.prompt, ...pendingPrompts.map((item) => item.text)].filter(Boolean).join("\n");
    row.lastSeq = Math.max(
      row.lastSeq ?? 0,
      ...pendingPrompts.map((item) => item.seq)
    );
  }
  const result = [...turns.values()].filter(
    (row) => row.startSeq !== null || row.completed || row.prompt !== "" || row.reply !== ""
  ).sort((left, right) => left.turn - right.turn);
  return { turns: result, forkCut };
}
function forkableTurns(entries) {
  return parseTurns(entries).turns.filter((row) => {
    if (row.prompt === "" && row.reply === "") return false;
    return Number.isSafeInteger(row.endSeq) || Number.isSafeInteger(row.lastSeq) || Number.isSafeInteger(row.startSeq);
  });
}
function readEntries(ctx, sessionId) {
  const binding = ctx.get("sessions")?.binding(sessionId);
  return binding?.eventSource?.getSnapshot?.()?.entries;
}

// src/actions.js
function makeActions(ctx, t, locale) {
  const say = (key, vars, kind = "info") => {
    commit(
      {
        toast: {
          id: uid("toast"),
          kind,
          message: fmt(t, key, vars)
        }
      },
      { persist: false }
    );
  };
  const workspaceItems = () => ctx.get("workspaces")?.list?.getSnapshot?.()?.items ?? [];
  const workspaceOfSession = (sessionId) => workspaceItems().find(
    (workspace) => workspace.sessionIds.includes(sessionId)
  );
  const workspaceById = (workspaceId) => workspaceItems().find((workspace) => workspace.workspaceId === workspaceId);
  const groupsInWorkspace = (workspaceId) => state.groups.filter((group) => group.workspaceId === workspaceId);
  const groupDepth = (groupId) => {
    let depth = 1;
    let cursor = state.groups.find((group) => group.id === groupId);
    const seen = /* @__PURE__ */ new Set();
    while (cursor?.parentId !== null && cursor?.parentId !== void 0) {
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
    if (target === void 0) return null;
    const workspace = workspaceOfSession(sessionId);
    if (workspace === void 0 || workspace.workspaceId !== target.workspaceId) {
      say("groups.crossWorkspace", void 0, "error");
      return null;
    }
    const groups = state.groups.map((group) => {
      const without = group.sessionIds.filter((id) => id !== sessionId);
      if (group.id === groupId) {
        return {
          ...group,
          sessionIds: [...without, sessionId],
          expanded: true
        };
      }
      return without.length === group.sessionIds.length ? group : { ...group, sessionIds: without };
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
      if (globalThis.navigator?.clipboard?.writeText !== void 0) {
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
      say("toast.copyFailed", void 0, "error");
      return false;
    }
  };
  const jumpToTurn = (sessionId, turn) => {
    openSession(sessionId);
    let attempts = 0;
    const tick = () => {
      const element = document.querySelector(
        `[data-turn-tail="${Number(turn)}"]`
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
    copySessionHandyData(sourceId, childId) {
      if (typeof sourceId !== "string" || sourceId === "" || typeof childId !== "string" || childId === "" || sourceId === childId) {
        return;
      }
      const notebooks = { ...state.notebooks ?? {} };
      const keyInfo = { ...state.keyInfo ?? {} };
      let changed = false;
      if (typeof state.notebooks?.[sourceId] === "string") {
        notebooks[childId] = state.notebooks[sourceId];
        changed = true;
      }
      const sourceKeyInfo = state.keyInfo?.[sourceId];
      if (sourceKeyInfo !== void 0) {
        keyInfo[childId] = {
          ...sourceKeyInfo,
          items: sourceKeyInfo.items.map((item) => ({ ...item })),
          panel: sourceKeyInfo.panel === void 0 ? { right: 16, top: 88 } : { ...sourceKeyInfo.panel }
        };
        changed = true;
      }
      if (changed) commit({ notebooks, keyInfo });
    },
    dismissToast() {
      commit({ toast: null }, { persist: false });
    },
    toggleHighlight(sessionId) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const highlights = { ...state.highlights };
      const active = highlights[sessionId] !== void 0;
      if (active) delete highlights[sessionId];
      else highlights[sessionId] = { at: Date.now() };
      commit({ highlights });
      say(active ? "toast.highlightOff" : "toast.highlightOn");
    },
    setNotebook(sessionId, text) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const notebooks = { ...state.notebooks ?? {} };
      const value = typeof text === "string" ? text : "";
      if (value === "") delete notebooks[sessionId];
      else notebooks[sessionId] = value;
      commit({ notebooks });
    },
    clearNotebook(sessionId) {
      api.setNotebook(sessionId, "");
      say("toast.notebookCleared");
    },
    setKeyInfoCollapsed(sessionId, collapsed) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const keyInfo = { ...state.keyInfo ?? {} };
      const entry = keyInfo[sessionId] ?? {
        collapsed: true,
        items: [],
        panel: { right: 16, top: 88 }
      };
      keyInfo[sessionId] = { ...entry, collapsed: collapsed === true };
      commit({ keyInfo });
    },
    setKeyInfoPanelPos(sessionId, pos) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const keyInfo = { ...state.keyInfo ?? {} };
      const entry = keyInfo[sessionId] ?? {
        collapsed: true,
        items: [],
        panel: { right: 16, top: 88 }
      };
      const right = Number.isFinite(pos?.right) ? Math.max(0, pos.right) : entry.panel?.right ?? 16;
      const top = Number.isFinite(pos?.top) ? Math.max(0, pos.top) : entry.panel?.top ?? 88;
      keyInfo[sessionId] = {
        ...entry,
        panel: { right, top }
      };
      commit({ keyInfo });
    },
    addKeyInfoItem(sessionId, seed = {}) {
      if (typeof sessionId !== "string" || sessionId === "") return null;
      const keyInfo = { ...state.keyInfo ?? {} };
      const entry = keyInfo[sessionId] ?? {
        collapsed: true,
        items: [],
        panel: { right: 16, top: 88 }
      };
      const item = {
        id: uid("key"),
        name: typeof seed.name === "string" ? seed.name : "",
        value: typeof seed.value === "string" ? seed.value : "",
        note: typeof seed.note === "string" ? seed.note : "",
        collapsed: false
      };
      keyInfo[sessionId] = {
        ...entry,
        collapsed: false,
        items: [...entry.items, item]
      };
      commit({ keyInfo });
      return item.id;
    },
    setKeyInfoItemCollapsed(sessionId, itemId, collapsed) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const entry = state.keyInfo?.[sessionId];
      if (entry === void 0) return;
      commit({
        keyInfo: {
          ...state.keyInfo ?? {},
          [sessionId]: {
            ...entry,
            items: entry.items.map(
              (item) => item.id === itemId ? { ...item, collapsed: collapsed === true } : item
            )
          }
        }
      });
    },
    setAllKeyInfoItemsCollapsed(sessionId, collapsed) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const entry = state.keyInfo?.[sessionId];
      if (entry === void 0) return;
      commit({
        keyInfo: {
          ...state.keyInfo ?? {},
          [sessionId]: {
            ...entry,
            items: entry.items.map((item) => ({
              ...item,
              collapsed: collapsed === true
            }))
          }
        }
      });
    },
    updateKeyInfoItem(sessionId, itemId, patch) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const entry = state.keyInfo?.[sessionId];
      if (entry === void 0) return;
      const items = entry.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          name: typeof patch?.name === "string" ? patch.name : item.name,
          value: typeof patch?.value === "string" ? patch.value : item.value,
          note: typeof patch?.note === "string" ? patch.note : item.note
        };
      });
      commit({
        keyInfo: {
          ...state.keyInfo ?? {},
          [sessionId]: { ...entry, items }
        }
      });
    },
    removeKeyInfoItem(sessionId, itemId) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const entry = state.keyInfo?.[sessionId];
      if (entry === void 0) return;
      commit({
        keyInfo: {
          ...state.keyInfo ?? {},
          [sessionId]: {
            ...entry,
            items: entry.items.filter((item) => item.id !== itemId)
          }
        }
      });
    },
    async sendKeyInfo(sessionId, text) {
      if (typeof sessionId !== "string" || sessionId === "") {
        say("keyInfo.noSession", void 0, "error");
        return false;
      }
      const body = String(text ?? "").trim();
      if (body === "") {
        say("keyInfo.noItems", void 0, "error");
        return false;
      }
      const binding = ctx.get("sessions")?.binding(sessionId);
      const session = binding?.session;
      if (session?.prompt === void 0) {
        say("keyInfo.noSession", void 0, "error");
        return false;
      }
      try {
        const result = await session.prompt(
          [{ type: "text", text: body }],
          "queue"
        );
        if (result?.ok === false) {
          throw new Error(
            `${result.error?.code ?? "prompt"}: ${result.error?.message ?? ""}`
          );
        }
        say("toast.keyInfoInjected");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("writer-held") || message.includes("active write handle")) {
          say("keyInfo.sessionInUse", void 0, "error");
        } else {
          say("toast.keyInfoFailed", { message }, "error");
        }
        return false;
      }
    },
    createGroup(workspaceId, parentId, rawName, sessionId) {
      const name2 = String(rawName ?? "").trim();
      const workspace = workspaceById(workspaceId);
      if (workspace === void 0) {
        say("groups.noWorkspace", void 0, "error");
        return null;
      }
      if (name2 === "") {
        say("groups.emptyName", void 0, "error");
        return null;
      }
      const siblings = state.groups.filter(
        (group2) => group2.workspaceId === workspaceId && group2.parentId === (parentId ?? null)
      );
      if (siblings.some(
        (group2) => group2.name.toLowerCase() === name2.toLowerCase()
      )) {
        say("groups.duplicate", void 0, "error");
        return null;
      }
      if (parentId !== null && parentId !== void 0) {
        const parent = state.groups.find((group2) => group2.id === parentId);
        if (parent === void 0 || parent.workspaceId !== workspaceId || groupDepth(parent.id) >= 3) {
          say("groups.depthLimit", void 0, "error");
          return null;
        }
      }
      const group = {
        id: uid("group"),
        workspaceId,
        parentId: parentId ?? null,
        name: name2,
        sessionIds: [],
        expanded: true,
        createdAt: Date.now()
      };
      commit({ groups: [...state.groups, group] });
      say("toast.groupCreated", { name: name2 });
      if (typeof sessionId === "string" && sessionId !== "")
        assignSession(group.id, sessionId);
      return state.groups.find((candidate) => candidate.id === group.id) ?? group;
    },
    promptCreateGroup(workspaceId, parentId = null, sessionId = null) {
      const parent = parentId === null ? void 0 : state.groups.find((group) => group.id === parentId);
      if (parentId !== null && (parent === void 0 || groupDepth(parentId) >= 3)) {
        say("groups.depthLimit", void 0, "error");
        return;
      }
      showTextDialog({
        title: parent === void 0 ? t("groups.createTitle") : t("groups.createChildTitle"),
        description: parent === void 0 ? t("groups.createDescription") : fmt(t, "groups.createChildDescription", { name: parent.name }),
        placeholder: t("groups.namePlaceholder"),
        confirmLabel: t("groups.create"),
        onConfirm: (name2) => {
          api.createGroup(workspaceId, parentId, name2, sessionId);
        }
      });
    },
    renameGroup(groupId, rawName) {
      const name2 = String(rawName ?? "").trim();
      if (name2 === "") return;
      const target = state.groups.find((group) => group.id === groupId);
      if (target === void 0) return;
      if (state.groups.some(
        (group) => group.id !== groupId && group.workspaceId === target.workspaceId && group.parentId === target.parentId && group.name.toLowerCase() === name2.toLowerCase()
      )) {
        say("groups.duplicate", void 0, "error");
        return;
      }
      commit({
        groups: state.groups.map(
          (group) => group.id === groupId ? { ...group, name: name2 } : group
        )
      });
    },
    promptRenameGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === void 0) return;
      showTextDialog({
        title: t("groups.renameTitle"),
        initialValue: group.name,
        placeholder: t("groups.namePlaceholder"),
        confirmLabel: t("common.save"),
        onConfirm: (name2) => api.renameGroup(groupId, name2)
      });
    },
    deleteGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === void 0) return;
      const removeIds = new Set(descendantGroupIds(groupId));
      const movedSessions = state.groups.filter((candidate) => removeIds.has(candidate.id)).flatMap((candidate) => candidate.sessionIds);
      const groups = state.groups.filter((candidate) => !removeIds.has(candidate.id)).map((candidate) => {
        if (candidate.id !== group.parentId) return candidate;
        return {
          ...candidate,
          sessionIds: [
            .../* @__PURE__ */ new Set([...candidate.sessionIds, ...movedSessions])
          ]
        };
      });
      commit({ groups });
      say("toast.groupDeleted");
    },
    promptDeleteGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === void 0) return;
      const children = descendantGroupIds(groupId).length - 1;
      showConfirmDialog({
        title: t("groups.deleteTitle"),
        description: children > 0 ? fmt(t, "groups.deleteNestedDescription", {
          name: group.name,
          n: children
        }) : fmt(t, "groups.deleteDescription", { name: group.name }),
        confirmLabel: t("common.delete"),
        danger: true,
        onConfirm: () => api.deleteGroup(groupId)
      });
    },
    toggleGroup(groupId) {
      commit({
        groups: state.groups.map(
          (group) => group.id === groupId ? { ...group, expanded: !group.expanded } : group
        )
      });
    },
    addSessionToGroup(groupId, sessionId) {
      if (typeof sessionId !== "string" || sessionId === "") return;
      const target = assignSession(groupId, sessionId);
      if (target !== null) say("toast.groupAdded", { name: target.name });
    },
    removeSessionFromGroup(groupId, sessionId) {
      commit({
        groups: state.groups.map(
          (group) => group.id === groupId ? {
            ...group,
            sessionIds: group.sessionIds.filter((id) => id !== sessionId)
          } : group
        )
      });
      say("toast.groupRemoved");
    },
    pickGroupForSession(sessionId) {
      const workspace = workspaceOfSession(sessionId);
      if (workspace === void 0) {
        say("groups.noWorkspace", void 0, "error");
        return;
      }
      const groups = groupsInWorkspace(workspace.workspaceId);
      if (groups.length === 0) {
        api.promptCreateGroup(workspace.workspaceId, null, sessionId);
        return;
      }
      const options = groups.slice().sort((left, right) => left.createdAt - right.createdAt).map((group) => ({
        value: group.id,
        label: `${"\u2014 ".repeat(Math.max(0, groupDepth(group.id) - 1))}${group.name}`
      }));
      showChoiceDialog({
        title: t("groups.pickGroup"),
        description: t("groups.pickGroupDescription"),
        options,
        extra: {
          label: t("groups.createAndAdd"),
          value: "__new__"
        },
        onSelect: (value) => {
          if (value === "__new__") {
            api.promptCreateGroup(workspace.workspaceId, null, sessionId);
            return;
          }
          api.addSessionToGroup(value, sessionId);
        }
      });
    },
    pickSessionForGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === void 0) return;
      const workspace = workspaceById(group.workspaceId);
      if (workspace === void 0) return;
      const sessions = ctx.get("sessions")?.list?.getSnapshot?.()?.byId ?? {};
      const options = workspace.sessionIds.filter((id) => !group.sessionIds.includes(id)).map((id) => sessions[id]).filter((session) => session !== void 0).map((session) => ({
        value: session.id,
        label: sessionTitle(session, t),
        detail: formatTime(session.updatedAt, locale)
      }));
      if (options.length === 0) {
        say("groups.noUngroupedSessions", void 0, "error");
        return;
      }
      showChoiceDialog({
        title: t("groups.addSessionTitle"),
        description: fmt(t, "groups.addSessionDescription", {
          name: group.name
        }),
        options,
        onSelect: (sessionId) => api.addSessionToGroup(groupId, sessionId)
      });
    },
    createSessionInGroup(groupId) {
      const group = state.groups.find((candidate) => candidate.id === groupId);
      if (group === void 0) return;
      const workspace = workspaceById(group.workspaceId);
      if (workspace === void 0) return;
      try {
        ctx.get("uiWorkspace")?.startSession(group.workspaceId, { clearPreviousDraft: false });
      } catch (error) {
        say(
          "groups.createSessionFailed",
          { message: error instanceof Error ? error.message : String(error) },
          "error"
        );
        return;
      }
      let attempts = 0;
      const tick = () => {
        const list = ctx.get("sessions")?.list?.getSnapshot?.();
        const current = currentSessionId(list);
        if (typeof current === "string" && workspaceOfSession(current)?.workspaceId === group.workspaceId) {
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
      if (group === void 0) return;
      const items = [
        {
          label: t("groups.addSession"),
          onSelect: () => api.pickSessionForGroup(groupId)
        },
        {
          label: t("groups.newSession"),
          onSelect: () => api.createSessionInGroup(groupId)
        }
      ];
      if (groupDepth(groupId) < 3) {
        items.push({
          label: t("groups.newChild"),
          onSelect: () => api.promptCreateGroup(group.workspaceId, groupId)
        });
      }
      items.push(
        {
          label: t("common.rename"),
          onSelect: () => api.promptRenameGroup(groupId)
        },
        {
          label: t("groups.deleteGroup"),
          danger: true,
          onSelect: () => api.promptDeleteGroup(groupId)
        }
      );
      showMenu(anchor, items);
    },
    showSessionMenu(anchor, sessionId, groupId) {
      showMenu(anchor, [
        { label: t("common.open"), onSelect: () => api.openSession(sessionId) },
        {
          label: t("groups.moveSession"),
          onSelect: () => api.pickGroupForSession(sessionId)
        },
        {
          label: t("groups.removeSession"),
          onSelect: () => api.removeSessionFromGroup(groupId, sessionId)
        },
        {
          label: state.highlights[sessionId] === void 0 ? t("menu.highlight") : t("menu.unhighlight"),
          onSelect: () => api.toggleHighlight(sessionId)
        }
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
            createdAt: Date.now()
          }
        }
      });
    }
  };
  return api;
}

// src/styles.js
var CSS = `
:root {
  --hy-brand: var(--dsw-alias-brand-primary, #4f6ef7);
  --hy-bg: var(--dsw-alias-bg-layer-1, #ffffff);
  --hy-bg-soft: var(--dsw-alias-bg-layer-2, #f7f8fa);
  --hy-border: var(--dsw-alias-border-l2, #e5e7eb);
  --hy-border-soft: var(--dsw-alias-border-l1, #eef0f3);
  --hy-text: var(--dsw-alias-label-primary, #1f2328);
  --hy-text-2: var(--dsw-alias-label-secondary, #5c6370);
  --hy-text-3: var(--dsw-alias-label-tertiary, #8b93a1);
  --hy-hover: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.045));
  --hy-danger: var(--dsw-alias-state-error-primary, #dc2626);
  --hy-warn: var(--dsw-alias-state-warn-primary, #b45309);
  --hy-radius: var(--dsw-radius-lg, 10px);
  --hy-radius-sm: var(--dsw-radius-sm, 6px);
}
.hy-root, .hy-dashboard, .hy-toast, .hy-tab-menu-item {
  font-family: var(--dsw-font-family, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
}
/* The plugin supplies "close current" for every tab; hide the dockkit's
   built-in close row so the tab menu does not offer two close actions. */
[data-dockkit-tab-menu] [data-dockkit-menu-close] {
  display: none !important;
}
.hy-dashboard {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: var(--hy-text);
  background: var(--dsw-specific-conversation-fill, var(--hy-bg));
}
.hy-head {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 26px 12px;
}
.hy-head-mark {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--hy-brand), color-mix(in srgb, var(--hy-brand) 55%, #8b5cf6));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--hy-brand) 22%, transparent);
  font-size: 17px;
}
.hy-head-copy { min-width: 0; flex: 1; }
.hy-title { margin: 0; font-size: 18px; line-height: 24px; font-weight: 650; letter-spacing: .01em; }
.hy-subtitle { margin-top: 3px; color: var(--hy-text-3); font-size: 12px; line-height: 18px; }
.hy-tabs {
  flex: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 22px;
  border-bottom: 1px solid var(--hy-border-soft);
}
.hy-tab {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text-3);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  padding: 9px 11px 10px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
}
.hy-tab:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-tab[data-active="true"] { color: var(--hy-text); font-weight: 600; }
.hy-tab[data-active="true"]::after {
  content: "";
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--hy-brand);
}
.hy-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  margin-left: 5px;
  border-radius: 999px;
  background: var(--hy-hover);
  color: var(--hy-text-3);
  font-size: 10px;
  font-weight: 600;
}
.hy-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 22px 32px;
  scrollbar-gutter: stable;
}
.hy-body-inner { max-width: 900px; margin: 0 auto; }
.hy-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.hy-segment {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--hy-border-soft);
  border-radius: 999px;
  background: var(--hy-bg-soft);
}
.hy-segment button {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text-3);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.hy-segment button[data-active="true"] {
  color: var(--hy-text);
  background: var(--hy-bg);
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.hy-input {
  box-sizing: border-box;
  min-width: 0;
  height: 32px;
  flex: 1;
  border: 1px solid var(--hy-border);
  border-radius: 8px;
  background: var(--hy-bg);
  color: var(--hy-text);
  font: inherit;
  font-size: 13px;
  padding: 0 10px;
  outline: none;
}
.hy-input:focus { border-color: var(--hy-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hy-brand) 15%, transparent); }
.hy-btn {
  appearance: none;
  border: 1px solid var(--hy-border);
  background: var(--hy-bg);
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.hy-btn:hover { background: var(--hy-hover); }
.hy-btn-primary {
  border-color: transparent;
  background: var(--hy-brand);
  color: #fff;
}
.hy-btn-primary:hover { filter: brightness(.95); background: var(--hy-brand); }
.hy-btn-ghost { border-color: transparent; background: transparent; color: var(--hy-text-2); }
.hy-btn-ghost:hover { background: var(--hy-hover); color: var(--hy-text); }
.hy-btn-danger { color: var(--hy-danger); }
.hy-btn-danger-text { background: transparent; color: var(--hy-danger); border-color: transparent; }
.hy-btn-danger-text:hover { background: color-mix(in srgb, var(--hy-danger) 12%, transparent); }
.hy-btn-sm { height: 26px; padding: 0 8px; font-size: 11px; border-radius: 6px; }
.hy-icon-btn {
  appearance: none;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 14px;
  line-height: 1;
}
.hy-icon-btn:hover { background: var(--hy-hover); color: var(--hy-text); }
.hy-empty {
  border: 1px dashed var(--hy-border);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  color: var(--hy-text-3);
  font-size: 13px;
  line-height: 20px;
  background: color-mix(in srgb, var(--hy-bg-soft) 55%, transparent);
}
.hy-hint { color: var(--hy-text-3); font-size: 11px; line-height: 17px; }
.hy-group {
  border: 1px solid var(--hy-border-soft);
  border-radius: 12px;
  background: var(--hy-bg);
  margin-bottom: 10px;
  overflow: hidden;
}
.hy-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  cursor: pointer;
  user-select: none;
}
.hy-group-head:hover { background: var(--hy-hover); }
.hy-group-name { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hy-group-count { color: var(--hy-text-3); font-size: 11px; }
.hy-group-body { border-top: 1px solid var(--hy-border-soft); padding: 6px; }
.hy-session-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.hy-session-row:hover { background: var(--hy-hover); }
.hy-session-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hy-border); flex: none; }
.hy-session-row[data-highlight="true"] .hy-session-dot { background: var(--hy-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hy-brand) 14%, transparent); }
.hy-session-copy { min-width: 0; flex: 1; }
.hy-session-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--hy-text); }
.hy-session-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: var(--hy-text-3); margin-top: 1px; }
.hy-session-actions { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity .12s; }
.hy-session-row:hover .hy-session-actions, .hy-session-row:focus-within .hy-session-actions { opacity: 1; }
.hy-star { color: var(--hy-warn); }
.hy-star[data-on="false"] { color: var(--hy-text-3); }
.hy-pending {
  border: 1px solid color-mix(in srgb, var(--hy-brand) 30%, var(--hy-border));
  background: color-mix(in srgb, var(--hy-brand) 5%, var(--hy-bg));
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.hy-pending-title { font-size: 12px; line-height: 18px; color: var(--hy-text-2); margin-bottom: 8px; }
.hy-pending-list { display: flex; flex-wrap: wrap; gap: 6px; }
.hy-row-action {
  appearance: none;
  border: 0;
  background: none;
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}
.hy-row-action:hover { color: var(--hy-warn); background: var(--hy-hover); }
.hy-row-action[data-on="true"] { color: var(--hy-warn); }
.hy-tab-menu-item {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 26px;
  text-align: left;
  width: 100%;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
}
.hy-tab-menu-item:hover { background: var(--hy-hover); }
.hy-tab-menu-item:disabled { color: var(--hy-text-3); cursor: default; background: none; }
.hy-menu-sep { height: 1px; background: var(--hy-border-soft); margin: 4px 6px; }
.hy-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 2147483000;
  max-width: min(460px, calc(100vw - 32px));
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--hy-text);
  color: var(--hy-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,.22);
  font-size: 12px;
  line-height: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: hy-toast-in .16s ease-out;
  pointer-events: none;
}
.hy-toast[data-kind="error"] { background: var(--hy-danger); color: #fff; }
@keyframes hy-toast-in { from { opacity: 0; transform: translate(-50%, 6px); } to { opacity: 1; transform: translate(-50%, 0); } }
.hy-groups {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 2px 0 4px;
  min-width: 0;
}
.hy-group-row {
  box-sizing: border-box;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
  border-radius: var(--dsw-radius-md);
  color: var(--hy-text);
  cursor: pointer;
  user-select: none;
}
.hy-group-row:hover { background: var(--hy-hover); }
.hy-group-row[data-handy-drop="true"] {
  background: color-mix(in srgb, var(--hy-brand) 16%, transparent);
  outline: 1px dashed var(--hy-brand);
  outline-offset: -1px;
}
.hy-group-row[data-handy-drop="invalid"] {
  background: color-mix(in srgb, var(--hy-danger) 12%, transparent);
  outline: 1px dashed var(--hy-danger);
  outline-offset: -1px;
}
[data-handy-draggable="true"] { cursor: grab; }
[data-handy-dragging="true"] { opacity: .55; }
.hy-group-chevron { width: 14px; flex: none; color: var(--hy-text-3); font-size: 10px; text-align: center; }
.hy-group-folder { width: 16px; height: 16px; flex: none; color: var(--hy-text-3); display: inline-flex; align-items: center; justify-content: center; }
.hy-group-row[data-current="true"] .hy-group-folder { color: var(--hy-brand); }
.hy-group-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
}
.hy-group-count {
  flex: none;
  color: var(--hy-text-3);
  font-size: 10px;
  line-height: 16px;
}
.hy-group-menu, .hy-gsession-menu {
  appearance: none;
  border: 0;
  background: none;
  width: 18px;
  height: 18px;
  flex: none;
  padding: 0;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 13px;
  line-height: 1;
  opacity: .45;
}
.hy-group-row:hover .hy-group-menu, .hy-group-row:focus-within .hy-group-menu,
.hy-gsession:hover .hy-gsession-menu, .hy-gsession:focus-within .hy-gsession-menu { opacity: 1; }
.hy-group-menu:hover, .hy-gsession-menu:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-gsession {
  box-sizing: border-box;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
  border-radius: var(--dsw-radius-md);
  color: var(--hy-text);
  cursor: pointer;
  user-select: none;
}
.hy-gsession:hover { background: var(--hy-hover); }
.hy-gsession[data-current="true"] { background: var(--dsw-alias-interactive-bg-hover); }
.hy-gsession[data-highlight="true"] { background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 14%, transparent), transparent 75%); box-shadow: inset 2px 0 0 var(--hy-brand); }
.hy-gsession-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--hy-border); }
.hy-gsession[data-highlight="true"] .hy-gsession-dot { background: var(--hy-brand); }
.hy-gsession-title { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 20px; }
.hy-gsession-time { flex: none; color: var(--hy-text-3); font-size: 10px; line-height: 16px; }
.hy-gsession-star {
  appearance: none;
  border: 0;
  background: none;
  width: 18px;
  height: 18px;
  flex: none;
  padding: 0;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 12px;
  line-height: 1;
  opacity: 0;
}
.hy-gsession:hover .hy-gsession-star, .hy-gsession:focus-within .hy-gsession-star { opacity: 1; }
.hy-gsession-star[data-on="true"] { color: var(--hy-warn); opacity: 1; }
.hy-menu {
  position: fixed;
  z-index: 2147483000;
  min-width: 190px;
  max-width: 300px;
  padding: 5px;
  border: 1px solid var(--hy-border);
  border-radius: 10px;
  background: var(--hy-bg);
  box-shadow: 0 12px 34px rgba(0,0,0,.18);
  color: var(--hy-text);
}
.hy-menu-item {
  appearance: none;
  border: 0;
  background: none;
  width: 100%;
  height: 30px;
  padding: 0 9px;
  border-radius: 7px;
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 30px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}
.hy-menu-item:hover { background: var(--hy-hover); }
.hy-menu-item[data-danger="true"] { color: var(--hy-danger); }
.hy-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.25);
}
.hy-modal {
  width: min(400px, 100%);
  box-sizing: border-box;
  border: 1px solid var(--hy-border);
  border-radius: 14px;
  background: var(--hy-bg);
  box-shadow: 0 20px 60px rgba(0,0,0,.22);
  padding: 18px;
  color: var(--hy-text);
}
.hy-modal-title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 650; }
.hy-modal-desc { margin-top: 5px; color: var(--hy-text-3); font-size: 12px; line-height: 18px; }
.hy-modal-list { margin: 12px 0 0; max-height: 280px; overflow: auto; display: flex; flex-direction: column; gap: 3px; }
.hy-modal-option {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hy-modal-option:hover { background: var(--hy-hover); }
.hy-modal-option-detail { margin-left: auto; color: var(--hy-text-3); font-size: 10px; }
.hy-modal-actions { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; }
.hy-modal-error { margin-top: 7px; color: var(--hy-danger); font-size: 11px; line-height: 16px; min-height: 16px; }
.hy-modal .hy-input { width: 100%; margin-top: 12px; }
[data-handy-running="true"] svg[data-state="ongoing"] {
  color: #2563eb !important;
  filter: drop-shadow(0 0 3px rgba(37, 99, 235, .45));
}
[data-handy-highlight="true"] {
  background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 15%, transparent), transparent 72%) !important;
  box-shadow: inset 2px 0 0 var(--hy-brand);
}
[data-handy-highlight="true"]:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 21%, transparent), var(--hy-hover) 85%) !important;
}
[data-handy-highlight="true"] .hy-star, [data-handy-highlight="true"] .hy-row-action[data-on="true"] { color: var(--hy-warn); }
body[data-ds-dark-theme] .hy-dashboard { background: var(--dsw-specific-conversation-fill, #17181b); }

/* Notebook tab ---------------------------------------------------------- */
.hy-notebook {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px 28px 26px;
  background: var(--dsw-alias-bg-base);
  color: var(--hy-text);
}
.hy-notebook-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--hy-border);
}
.hy-notebook-head-copy { min-width: 0; }
.hy-notebook-title { margin: 0; font-size: 17px; line-height: 24px; font-weight: 650; }
.hy-notebook-hint { margin-top: 3px; color: var(--hy-text-3); font-size: 11px; line-height: 16px; }
.hy-notebook-count { flex: none; color: var(--hy-text-3); font-size: 11px; }
.hy-notebook-editor {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  min-height: 260px;
  resize: none;
  border: 1px solid var(--hy-border);
  border-radius: 12px;
  outline: none;
  padding: 14px 16px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--hy-text);
  font: 13px/1.75 var(--dsw-font-family, Inter, sans-serif);
  transition: border-color .12s, box-shadow .12s;
}
.hy-notebook-editor::placeholder { color: var(--hy-text-3); }
.hy-notebook-editor:focus {
  border-color: color-mix(in srgb, var(--hy-brand) 55%, var(--hy-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--hy-brand) 10%, transparent);
}
.hy-notebook-foot { display: flex; align-items: center; gap: 8px; }
.hy-notebook-saved { margin-left: auto; color: var(--hy-text-3); font-size: 10px; }

/* Floating key information panel ---------------------------------------- */
.hy-key-badge {
  position: fixed;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--hy-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, transparent);
  color: var(--hy-text-2);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  line-height: 1;
}
.hy-key-badge:hover { color: var(--hy-brand); border-color: color-mix(in srgb, var(--hy-brand) 45%, var(--hy-border)); }
.hy-key-badge-count {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 99px;
  display: inline-grid;
  place-items: center;
  background: color-mix(in srgb, var(--hy-brand) 14%, transparent);
  color: var(--hy-brand);
  font-size: 10px;
}
.hy-key-panel {
  position: fixed;
  z-index: 60;
  width: min(332px, calc(100vw - 32px));
  max-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--hy-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 96%, transparent);
  color: var(--hy-text);
  box-shadow: 0 18px 50px rgba(0, 0, 0, .18);
  backdrop-filter: blur(14px);
}
.hy-key-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--hy-border);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.hy-key-panel[data-handy-dragging="true"] .hy-key-head { cursor: grabbing; }
.hy-key-head-icon { color: var(--hy-brand); display: inline-grid; place-items: center; }
.hy-key-head-copy { min-width: 0; flex: 1; display: flex; align-items: baseline; gap: 7px; }
.hy-key-head-title { font-size: 12px; font-weight: 650; }
.hy-key-head-count { color: var(--hy-text-3); font-size: 10px; }
.hy-key-hide {
  appearance: none;
  border: 0;
  background: none;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: var(--hy-text-3);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}
.hy-key-hide:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-key-body {
  min-height: 0;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hy-key-empty {
  padding: 10px 8px;
  color: var(--hy-text-3);
  font-size: 11px;
  line-height: 17px;
}
.hy-key-item {
  border: 1px solid var(--hy-border);
  border-radius: 9px;
  padding: 7px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
}
.hy-key-tools {
  display: flex;
  gap: 10px;
  padding: 0 2px 2px;
}
.hy-key-tool {
  appearance: none;
  border: 0;
  background: none;
  padding: 0;
  color: var(--hy-text-3);
  cursor: pointer;
  font: inherit;
  font-size: 10px;
}
.hy-key-tool:hover { color: var(--hy-brand); }
.hy-key-item-head { display: flex; align-items: center; gap: 4px; }
.hy-key-item[data-collapsed="true"] { padding: 5px 7px; }
.hy-key-chevron {
  appearance: none;
  border: 0;
  background: none;
  width: 18px;
  height: 22px;
  flex: none;
  padding: 0;
  color: var(--hy-text-3);
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
}
.hy-key-chevron:hover { color: var(--hy-brand); }
.hy-key-summary {
  appearance: none;
  border: 0;
  background: none;
  min-width: 0;
  flex: 1;
  padding: 0;
  color: var(--hy-text);
  cursor: pointer;
  text-align: left;
  font: 600 12px/20px var(--dsw-font-family, Inter, sans-serif);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hy-key-summary:hover { color: var(--hy-brand); }
.hy-key-item-body { margin-top: 2px; }
.hy-key-name {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--hy-text);
  font: 600 12px/20px var(--dsw-font-family, Inter, sans-serif);
}
.hy-key-name::placeholder, .hy-key-note::placeholder, .hy-key-value::placeholder { color: var(--hy-text-3); }
.hy-key-item-actions { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.hy-key-mini {
  appearance: none;
  border: 0;
  background: none;
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 5px;
  color: var(--hy-text-3);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}
.hy-key-mini:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-key-remove:hover { color: var(--hy-danger); }
.hy-key-value {
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  resize: vertical;
  border: 0;
  outline: none;
  padding: 2px 1px;
  background: transparent;
  color: var(--hy-text);
  font: 12px/1.55 var(--dsw-font-mono, ui-monospace, monospace);
}
.hy-key-note {
  box-sizing: border-box;
  width: 100%;
  border: 0;
  border-top: 1px dashed color-mix(in srgb, var(--hy-border) 80%, transparent);
  outline: none;
  padding: 4px 1px 1px;
  background: transparent;
  color: var(--hy-text-3);
  font: 10px/1.45 var(--dsw-font-family, Inter, sans-serif);
}
.hy-key-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; padding-top: 2px; }
.hy-key-presets-label { width: 100%; color: var(--hy-text-3); font-size: 10px; }
.hy-key-preset {
  appearance: none;
  border: 1px solid var(--hy-border);
  border-radius: 999px;
  background: transparent;
  color: var(--hy-text-2);
  padding: 3px 8px;
  cursor: pointer;
  font: inherit;
  font-size: 10px;
}
.hy-key-preset:hover { color: var(--hy-brand); border-color: color-mix(in srgb, var(--hy-brand) 45%, var(--hy-border)); }
.hy-key-add {
  appearance: none;
  border: 1px dashed var(--hy-border);
  border-radius: 8px;
  background: transparent;
  color: var(--hy-text-2);
  height: 30px;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
}
.hy-key-add:hover { color: var(--hy-brand); border-color: color-mix(in srgb, var(--hy-brand) 45%, var(--hy-border)); }
.hy-key-foot {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 9px 10px 10px;
  border-top: 1px solid var(--hy-border);
}
.hy-key-inject {
  appearance: none;
  border: 0;
  border-radius: 8px;
  height: 32px;
  background: var(--hy-brand);
  color: #fff;
  cursor: pointer;
  font: 600 12px/1 var(--dsw-font-family, Inter, sans-serif);
}
.hy-key-inject:hover:not(:disabled) { filter: brightness(1.06); }
.hy-key-inject:disabled { opacity: .45; cursor: default; }
.hy-key-local { text-align: center; color: var(--hy-text-3); font-size: 10px; }
@media (max-width: 720px) {
  .hy-notebook { padding: 16px 14px 18px; }
  .hy-key-panel { max-height: calc(100vh - 120px); }
}
@media (max-width: 640px) {
  .hy-head { padding: 16px 16px 10px; }
  .hy-tabs { padding: 0 12px; }
  .hy-body { padding: 14px 12px 24px; }
  .hy-subtitle { display: none; }
}
`;
function injectStyle() {
  if (typeof document === "undefined") return;
  const key = "dsh-handy/global.css";
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(key)}]`) !== null)
    return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-handy";
  tag.dataset.pluginCss = key;
  tag.textContent = CSS;
  (document.head ?? document.documentElement).appendChild(tag);
}

// src/shared-ui.js
function useSessionsSnapshot(ctx) {
  const sessions = ctx.get("sessions");
  const subscribe = useCallback(
    (listener) => sessions.list.subscribe(listener),
    [sessions]
  );
  const getSnapshot = useCallback(
    () => sessions.list.getSnapshot(),
    [sessions]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function useWorkspacesSnapshot(ctx) {
  const workspaces = ctx.get("workspaces");
  const subscribe = useCallback(
    (listener) => workspaces.list.subscribe(listener),
    [workspaces]
  );
  const getSnapshot = useCallback(
    () => workspaces.list.getSnapshot(),
    [workspaces]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function useMenuItemClose(useMenuOpenState) {
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
        separatorBefore: separatorBefore === true
      },
      children
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
      "data-separator-before": separatorBefore === true ? "" : void 0
    },
    children
  );
}

// src/highlight.js
function StarButton({ sessionId, store: store2, actions, t }) {
  const state2 = useHandy();
  const active = state2.highlights[sessionId] !== void 0;
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
      }
    },
    active ? "\u2605" : "\u2606"
  );
}
function HighlightMenuItem({ sessionId, useMenuOpenState, store: store2, actions, t }) {
  const state2 = useHandy();
  const active = state2.highlights[sessionId] !== void 0;
  const close = useMenuItemClose(useMenuOpenState);
  return h(
    MenuRow,
    {
      separatorBefore: true,
      onSelect: () => {
        close();
        actions.toggleHighlight(sessionId);
      }
    },
    active ? t("menu.unhighlight") : t("menu.highlight")
  );
}
function syncHighlightRows() {
  if (typeof document === "undefined") return;
  const highlighted = state.highlights;
  for (const row of document.querySelectorAll('[data-row-key^="session:"]')) {
    const key = row.getAttribute("data-row-key");
    const sessionId = key === null ? "" : key.slice("session:".length);
    if (highlighted[sessionId] !== void 0)
      row.setAttribute("data-handy-highlight", "true");
    else row.removeAttribute("data-handy-highlight");
  }
}
function installHighlightObserver(ctx) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {
    };
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
    if (typeof window === "undefined") return () => {
    };
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      const next = loadState();
      commit(
        {
          highlights: next.highlights,
          groups: next.groups,
          forks: next.forks,
          notebooks: next.notebooks,
          keyInfo: next.keyInfo
        },
        { persist: false }
      );
      syncHighlightRows();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, "dsh-handy: cross-window storage sync");
}

// src/menu-items.js
function GroupMenuItem({ sessionId, useMenuOpenState, store: store2, actions, t }) {
  const close = useMenuItemClose(useMenuOpenState);
  return h(
    MenuRow,
    {
      onSelect: () => {
        close();
        actions.pickGroupForSession(sessionId);
      }
    },
    t("menu.addGroup")
  );
}

// src/file-tabs.js
function closeTabIds(sidebar, ids) {
  if (sidebar === null || sidebar === void 0) return;
  for (const id of [...ids].reverse()) {
    try {
      sidebar.close(id);
    } catch (error) {
      console.warn("dsh-handy: close tab failed", id, error);
    }
  }
}
function TabMenuAction({ tab, dismiss, mode, sessionId, t }) {
  const controller = globalThis.__dshHandySidebarRight;
  if (tab === null || typeof tab !== "object") return null;
  const tabId = tab.id;
  if (typeof tabId !== "string" || tabId === "") return null;
  const safeTabId = String(tabId).replaceAll('"', '\\"');
  const tabElement = typeof document !== "undefined" ? document.querySelector(`[data-dockkit-tab="${safeTabId}"]`) : null;
  if (tabElement === null) return null;
  const pane = tabElement.closest("[data-dockkit-pane], [data-dockkit-float]");
  const paneTabs = pane === null ? [] : [...pane.querySelectorAll("[data-dockkit-tab]")].map((element) => element.dataset.dockkitTab).filter(Boolean);
  const safeSessionId = String(sessionId).replaceAll('"', '\\"');
  const allTabs = typeof document === "undefined" ? [] : [
    ...document.querySelectorAll(
      `[data-sidebar-right-session="${safeSessionId}"] [data-dockkit-tab]`
    )
  ].map((element) => element.dataset.dockkitTab).filter(Boolean);
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
      }
    },
    label
  );
}

// src/toast.js
function HandyToast({ store: store2, actions, t }) {
  const state2 = useHandy();
  const toast = state2.toast;
  useEffect(() => {
    if (toast === null) return void 0;
    const timer = globalThis.setTimeout(() => actions.dismissToast(), 2800);
    return () => globalThis.clearTimeout(timer);
  }, [toast?.id, actions]);
  if (toast === null) return null;
  return h(
    "div",
    {
      className: "hy-toast",
      "data-kind": toast.kind === "error" ? "error" : "info",
      role: "status"
    },
    h("span", { "aria-hidden": "true" }, toast.kind === "error" ? "!" : "\u2713"),
    h("span", null, toast.message)
  );
}

// src/notebook.js
function NotebookView({
  sessionId: viewSessionId,
  handySessionId,
  handyActions,
  t: viewT
}) {
  const state2 = useHandy();
  const sid = viewSessionId ?? handySessionId;
  const stored = sid === void 0 ? "" : state2.notebooks?.[sid] ?? "";
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
        if (sid !== void 0) handyActions?.setNotebook(sid, latest.current);
      }
    },
    [sid, handyActions]
  );
  const flush = (value) => {
    if (timer.current !== null) {
      globalThis.clearTimeout(timer.current);
      timer.current = null;
    }
    if (sid !== void 0) handyActions?.setNotebook(sid, value);
  };
  const onChange = (value) => {
    latest.current = value;
    setDraft(value);
    if (timer.current !== null) globalThis.clearTimeout(timer.current);
    timer.current = globalThis.setTimeout(() => {
      timer.current = null;
      if (sid !== void 0) handyActions?.setNotebook(sid, value);
    }, 250);
  };
  const count = [...draft].length;
  const t = typeof viewT === "function" ? viewT : (key) => key;
  if (sid === void 0) {
    return h(
      "div",
      { className: "hy-notebook" },
      h("div", { className: "hy-empty" }, t("common.noSession"))
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
        h("div", { className: "hy-notebook-hint" }, t("notebook.hint"))
      ),
      h(
        "span",
        { className: "hy-notebook-count" },
        t("notebook.chars", { n: count })
      )
    ),
    h("textarea", {
      className: "hy-notebook-editor",
      value: draft,
      placeholder: t("notebook.placeholder"),
      "aria-label": t("notebook.title"),
      onChange: (event) => onChange(event.target.value),
      onBlur: () => flush(draft)
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
          }
        },
        t("notebook.clear")
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-btn hy-btn-sm",
          onClick: () => handyActions?.copy(draft)
        },
        t("notebook.copy")
      ),
      h("span", { className: "hy-notebook-saved" }, t("notebook.saved"))
    )
  );
}

// src/key-info.js
var DEFAULT_PANEL = { right: 16, top: 88 };
var PANEL_WIDTH = 332;
var BADGE_WIDTH = 48;
function KeyGlyph() {
  return h(
    "svg",
    {
      width: 15,
      height: 15,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true"
    },
    h("circle", {
      cx: 5.2,
      cy: 10.8,
      r: 2.7,
      stroke: "currentColor",
      strokeWidth: 1.2
    }),
    h("path", {
      d: "M7.2 8.8 13 3m-2.3.2 2.2 2.2M8.9 5.1 10.7 7",
      stroke: "currentColor",
      strokeWidth: 1.2,
      strokeLinecap: "round"
    })
  );
}
function buildInjection(items, t) {
  const lines = [t("keyInfo.injectPreamble")];
  for (const item of items) {
    const name2 = item.name.trim() === "" ? t("keyInfo.untitled") : item.name.trim();
    const value = item.value.trim();
    if (value === "") continue;
    lines.push(fmt(t, "keyInfo.injectItem", { name: name2, value }));
    if (item.note.trim() !== "") {
      lines.push(fmt(t, "keyInfo.injectNote", { note: item.note.trim() }));
    }
  }
  return lines.join("\n");
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function conversationBounds(anchor = null) {
  if (typeof document === "undefined") {
    const width2 = globalThis.innerWidth ?? 1200;
    const height2 = globalThis.innerHeight ?? 800;
    return { left: 0, top: 0, right: width2, bottom: height2 };
  }
  const element = anchor?.closest?.('[class*="centerCol"]') ?? document.querySelector('[class*="centerCol"]') ?? document.querySelector('[data-slot="main.conversation"]') ?? document.querySelector('[data-slot="conversation.view"]');
  if (element !== null) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  const width = globalThis.innerWidth ?? 1200;
  const height = globalThis.innerHeight ?? 800;
  return { left: 0, top: 0, right: width, bottom: height };
}
function KeyInfoPanel({ sessionId, handyActions, t }) {
  const state2 = useHandy();
  const sid = sessionId;
  const entry = sid === void 0 ? void 0 : state2.keyInfo?.[sid] ?? {
    collapsed: true,
    items: [],
    panel: DEFAULT_PANEL
  };
  const [sending, setSending] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const [bounds, setBounds] = useState(() => conversationBounds());
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragPos, setDragPos] = useState(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  useEffect(() => {
    const update = () => {
      const anchor = panelRef.current;
      setBounds(conversationBounds(anchor));
      if (anchor !== null) {
        setSize({ width: anchor.offsetWidth, height: anchor.offsetHeight });
      }
    };
    update();
    const area = panelRef.current?.closest('[class*="centerCol"]') ?? document.querySelector('[class*="centerCol"]');
    let observer = null;
    if (typeof ResizeObserver === "function" && area !== null) {
      observer = new ResizeObserver(update);
      observer.observe(area);
    }
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [sid, entry?.collapsed]);
  useEffect(() => {
    if (focusId === null) return;
    const node = panelRef.current?.querySelector(
      `[data-key-id="${focusId}"] input`
    );
    node?.focus?.();
    setFocusId(null);
  }, [focusId]);
  useEffect(
    () => () => {
      dragRef.current?.cleanup?.();
    },
    []
  );
  if (sid === void 0 || entry === void 0) return null;
  const items = entry.items;
  const complete = items.filter((item) => item.value.trim() !== "");
  const count = items.length;
  const panel = entry.panel ?? DEFAULT_PANEL;
  const width = size.width > 0 ? size.width : entry.collapsed ? BADGE_WIDTH : PANEL_WIDTH;
  const height = size.height > 0 ? size.height : entry.collapsed ? 32 : 360;
  const left = clamp(
    bounds.right - width - (panel.right ?? 16),
    bounds.left + 8,
    Math.max(bounds.left + 8, bounds.right - width - 8)
  );
  const top = clamp(
    bounds.top + (panel.top ?? 88),
    bounds.top + 8,
    Math.max(bounds.top + 8, bounds.bottom - height - 8)
  );
  const position = dragPos ?? { left, top };
  const add = (seed = {}) => {
    const id = handyActions?.addKeyInfoItem(sid, seed);
    if (typeof id === "string") setFocusId(id);
  };
  const startDrag = (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button, input, textarea, select")) {
      return;
    }
    const element = panelRef.current;
    if (element === null) return;
    const rect = element.getBoundingClientRect();
    const area = conversationBounds(element);
    const drag = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      width: rect.width,
      height: rect.height,
      area,
      latest: { left: rect.left, top: rect.top },
      cleanup: null
    };
    const move = (moveEvent) => {
      const nextLeft = clamp(
        drag.startLeft + moveEvent.clientX - drag.startX,
        area.left + 8,
        Math.max(area.left + 8, area.right - drag.width - 8)
      );
      const nextTop = clamp(
        drag.startTop + moveEvent.clientY - drag.startY,
        area.top + 8,
        Math.max(area.top + 8, area.bottom - drag.height - 8)
      );
      drag.latest = { left: nextLeft, top: nextTop };
      setDragPos(drag.latest);
    };
    const cancel = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      drag.cleanup = null;
      dragRef.current = null;
    };
    const finish = () => {
      cancel();
      setDragPos(null);
      handyActions?.setKeyInfoPanelPos(sid, {
        right: Math.max(0, drag.area.right - drag.latest.left - drag.width),
        top: Math.max(0, drag.latest.top - drag.area.top)
      });
    };
    drag.cleanup = cancel;
    dragRef.current = drag;
    setDragPos(drag.latest);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    event.preventDefault();
  };
  if (entry.collapsed) {
    return h(
      "button",
      {
        type: "button",
        className: "hy-key-badge",
        ref: panelRef,
        style: { left: `${position.left}px`, top: `${position.top}px` },
        title: t("keyInfo.show"),
        "aria-label": t("keyInfo.show"),
        onClick: () => handyActions?.setKeyInfoCollapsed(sid, false)
      },
      h(KeyGlyph),
      count > 0 ? h("span", { className: "hy-key-badge-count" }, String(count)) : null
    );
  }
  const presets = [
    {
      key: "target",
      label: t("keyInfo.presetTarget"),
      seed: { name: t("keyInfo.presetTarget") }
    },
    {
      key: "ssh",
      label: t("keyInfo.presetSsh"),
      seed: { name: t("keyInfo.presetSsh") }
    },
    {
      key: "web",
      label: t("keyInfo.presetWeb"),
      seed: { name: t("keyInfo.presetWeb") }
    },
    {
      key: "db",
      label: t("keyInfo.presetDb"),
      seed: { name: t("keyInfo.presetDb") }
    }
  ];
  const inject2 = async () => {
    if (complete.length === 0) {
      handyActions?.say("keyInfo.noItems", void 0, "error");
      return;
    }
    setSending(true);
    try {
      await handyActions?.sendKeyInfo(sid, buildInjection(items, t));
    } finally {
      setSending(false);
    }
  };
  return h(
    "aside",
    {
      className: "hy-key-panel",
      ref: panelRef,
      style: { left: `${position.left}px`, top: `${position.top}px` },
      "data-handy-key-info": "true",
      "data-handy-dragging": dragPos === null ? void 0 : "true",
      "aria-label": t("keyInfo.title")
    },
    h(
      "div",
      {
        className: "hy-key-head",
        onPointerDown: startDrag,
        onDoubleClick: (event) => {
          if (event.target instanceof Element && event.target.closest("button, input, textarea, select")) {
            return;
          }
          handyActions?.setKeyInfoPanelPos(sid, DEFAULT_PANEL);
        }
      },
      h("span", { className: "hy-key-head-icon" }, h(KeyGlyph)),
      h(
        "span",
        { className: "hy-key-head-copy" },
        h("span", { className: "hy-key-head-title" }, t("keyInfo.title")),
        h(
          "span",
          { className: "hy-key-head-count" },
          fmt(t, "keyInfo.count", { n: count })
        )
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-key-hide",
          title: t("keyInfo.hide"),
          "aria-label": t("keyInfo.hide"),
          onClick: () => handyActions?.setKeyInfoCollapsed(sid, true)
        },
        "\xD7"
      )
    ),
    h(
      "div",
      { className: "hy-key-body" },
      items.length === 0 ? h("div", { className: "hy-key-empty" }, t("keyInfo.empty")) : h(
        "div",
        { className: "hy-key-tools" },
        h(
          "button",
          {
            type: "button",
            className: "hy-key-tool",
            onClick: () => handyActions?.setAllKeyInfoItemsCollapsed(sid, true)
          },
          t("keyInfo.collapseAll")
        ),
        h(
          "button",
          {
            type: "button",
            className: "hy-key-tool",
            onClick: () => handyActions?.setAllKeyInfoItemsCollapsed(sid, false)
          },
          t("keyInfo.expandAll")
        )
      ),
      items.map(
        (item) => h(
          "div",
          {
            className: "hy-key-item",
            key: item.id,
            "data-key-id": item.id,
            "data-collapsed": item.collapsed ? "true" : "false"
          },
          h(
            "div",
            { className: "hy-key-item-head" },
            h(
              "button",
              {
                type: "button",
                className: "hy-key-chevron",
                title: t(
                  item.collapsed ? "keyInfo.expand" : "keyInfo.collapse"
                ),
                "aria-label": t(
                  item.collapsed ? "keyInfo.expand" : "keyInfo.collapse"
                ),
                "aria-expanded": item.collapsed !== true,
                onClick: () => handyActions?.setKeyInfoItemCollapsed(
                  sid,
                  item.id,
                  item.collapsed !== true
                )
              },
              item.collapsed ? "\u203A" : "\u2304"
            ),
            item.collapsed ? h(
              "button",
              {
                type: "button",
                className: "hy-key-summary",
                onClick: () => handyActions?.setKeyInfoItemCollapsed(
                  sid,
                  item.id,
                  false
                )
              },
              item.name.trim() === "" ? t("keyInfo.untitled") : item.name
            ) : h("input", {
              className: "hy-key-name",
              value: item.name,
              placeholder: t("keyInfo.namePlaceholder"),
              "aria-label": t("keyInfo.namePlaceholder"),
              onChange: (event) => handyActions?.updateKeyInfoItem(sid, item.id, {
                name: event.target.value
              })
            }),
            item.collapsed ? null : h(
              "span",
              { className: "hy-key-item-actions" },
              h(
                "button",
                {
                  type: "button",
                  className: "hy-key-mini",
                  title: t("keyInfo.copy"),
                  "aria-label": t("keyInfo.copy"),
                  onClick: () => handyActions?.copy(item.value)
                },
                "\u29C9"
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "hy-key-mini hy-key-remove",
                  title: t("keyInfo.remove"),
                  "aria-label": t("keyInfo.remove"),
                  onClick: () => handyActions?.removeKeyInfoItem(sid, item.id)
                },
                "\xD7"
              )
            )
          ),
          item.collapsed ? null : h(
            "div",
            { className: "hy-key-item-body" },
            h("textarea", {
              className: "hy-key-value",
              value: item.value,
              rows: 2,
              placeholder: t("keyInfo.valuePlaceholder"),
              "aria-label": t("keyInfo.valuePlaceholder"),
              spellCheck: false,
              onChange: (event) => handyActions?.updateKeyInfoItem(sid, item.id, {
                value: event.target.value
              })
            }),
            h("input", {
              className: "hy-key-note",
              value: item.note,
              placeholder: t("keyInfo.notePlaceholder"),
              "aria-label": t("keyInfo.notePlaceholder"),
              onChange: (event) => handyActions?.updateKeyInfoItem(sid, item.id, {
                note: event.target.value
              })
            })
          )
        )
      ),
      h(
        "div",
        { className: "hy-key-presets" },
        h(
          "span",
          { className: "hy-key-presets-label" },
          t("keyInfo.addPreset")
        ),
        presets.map(
          (preset) => h(
            "button",
            {
              type: "button",
              className: "hy-key-preset",
              key: preset.key,
              onClick: () => add(preset.seed)
            },
            preset.label
          )
        )
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-key-add",
          onClick: () => add({})
        },
        `\uFF0B ${t("keyInfo.add")}`
      )
    ),
    h(
      "div",
      { className: "hy-key-foot" },
      h(
        "button",
        {
          type: "button",
          className: "hy-key-inject",
          disabled: sending || complete.length === 0,
          onClick: inject2
        },
        sending ? t("keyInfo.injecting") : t("keyInfo.inject")
      ),
      h("span", { className: "hy-key-local" }, t("keyInfo.localOnly"))
    )
  );
}

// src/groups.js
function FolderGlyph({ open }) {
  return h(
    "svg",
    {
      width: 16,
      height: 16,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      strokeWidth: 1
    },
    h("path", {
      d: open ? "M1.5 3.1c0-.55.45-1 1-1h2.93c.24 0 .48.09.66.25l1.62 1.43c.18.16.41.25.66.25h4.12c.55 0 1 .44 1 1v1.1H1.5V3.1Z" : "M1.5 3.1c0-.55.45-1 1-1h2.93c.24 0 .48.09.66.25l1.62 1.43c.18.16.41.25.66.25h4.12c.55 0 1 .44 1 1v7.85c0 .55-.45 1-1 1h-11c-.55 0-1-.45-1-1V3.1Z",
      stroke: "currentColor"
    }),
    h("path", {
      d: open ? "M1.85 6.4h12.3l-1.2 5.4c-.1.45-.5.77-.96.77H2.4c-.6 0-1.04-.55-.9-1.13L2.7 6.4h-.85Z" : "M3.6 7.7h8.8",
      stroke: "currentColor"
    })
  );
}
function GroupSessionLine({
  session,
  group,
  depth,
  state: state2,
  actions,
  t,
  locale,
  currentId
}) {
  const highlighted = state2.highlights[session.id] !== void 0;
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
        if (event.target instanceof Element && event.target.closest("button, a, input, textarea")) {
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
      tabIndex: 0
    },
    h("span", { className: "hy-gsession-dot", "aria-hidden": "true" }),
    h("span", { className: "hy-gsession-title" }, sessionTitle(session, t)),
    h(
      "span",
      { className: "hy-gsession-time" },
      formatTime(session.updatedAt, locale)
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
        }
      },
      highlighted ? "\u2605" : "\u2606"
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
        }
      },
      "\u22EF"
    )
  );
}
function GroupBranch({
  groupId,
  depth,
  groups,
  workspace,
  sessions,
  state: state2,
  actions,
  t,
  locale,
  currentId
}) {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (group === void 0 || group.workspaceId !== workspace.workspaceId)
    return null;
  const children = groups.filter((candidate) => candidate.parentId === groupId).sort((left, right) => left.createdAt - right.createdAt);
  const rows = group.sessionIds.filter((id) => workspace.sessionIds.includes(id)).map((id) => sessions[id]).filter((session) => session !== void 0);
  const branchContainsCurrent = (id) => {
    const candidate = groups.find((group2) => group2.id === id);
    if (candidate === void 0) return false;
    if (candidate.sessionIds.includes(currentId)) return true;
    return groups.some(
      (child) => child.parentId === id && branchContainsCurrent(child.id)
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
            draggedSession.workspaceId === group.workspaceId ? "true" : "invalid"
          );
        },
        onDragLeave: (event) => {
          if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
            return;
          event.currentTarget.removeAttribute("data-handy-drop");
        },
        onDrop: (event) => {
          event.preventDefault();
          const dragged = draggedSession;
          endSessionDrag();
          if (dragged === null) return;
          if (dragged.workspaceId !== group.workspaceId) {
            actions.say("groups.crossWorkspace", void 0, "error");
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
        tabIndex: 0
      },
      h(
        "span",
        { className: "hy-group-chevron", "aria-hidden": "true" },
        group.expanded ? "\u25BE" : "\u25B8"
      ),
      h(
        "span",
        { className: "hy-group-folder" },
        h(FolderGlyph, { open: group.expanded })
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
          }
        },
        "\u22EF"
      )
    ),
    group.expanded ? h(
      "div",
      { role: "group" },
      children.map(
        (child) => h(GroupBranch, {
          key: child.id,
          groupId: child.id,
          depth: depth + 1,
          groups,
          workspace,
          sessions,
          state: state2,
          actions,
          t,
          locale,
          currentId
        })
      ),
      rows.map(
        (session) => h(GroupSessionLine, {
          key: session.id,
          session,
          group,
          depth,
          state: state2,
          actions,
          t,
          locale,
          currentId
        })
      )
    ) : null
  );
}
function WorkspaceGroupLayer({ workspaceId, ctx, store: store2, actions, t, locale }) {
  const state2 = useHandy();
  const sessions = useSessionsSnapshot(ctx).byId ?? {};
  const workspaces = useWorkspacesSnapshot(ctx);
  const workspace = workspaces.items?.find(
    (item) => item.workspaceId === workspaceId
  );
  if (workspace === void 0) return null;
  const groups = state2.groups.filter(
    (group) => group.workspaceId === workspaceId
  );
  if (groups.length === 0) return null;
  const roots = groups.filter((group) => group.parentId === null).sort((left, right) => left.createdAt - right.createdAt);
  const currentId = currentSessionId({ byId: sessions });
  return h(
    "div",
    { className: "hy-groups-layer", "data-workspace-id": workspaceId },
    roots.map(
      (group) => h(GroupBranch, {
        key: group.id,
        groupId: group.id,
        depth: 1,
        groups,
        workspace,
        sessions,
        state: state2,
        actions,
        t,
        locale,
        currentId
      })
    )
  );
}
function mountReactRoot(container) {
  if (ReactDOMClient?.createRoot !== void 0)
    return ReactDOMClient.createRoot(container);
  if (ReactDOM?.createRoot !== void 0) return ReactDOM.createRoot(container);
  if (ReactDOM?.render !== void 0) {
    return {
      render(element) {
        ReactDOM.render(element, container);
      },
      unmount() {
        ReactDOM.unmountComponentAtNode(container);
      }
    };
  }
  return null;
}
function installGroupSidebar(ctx, actions, t, locale) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {
    };
    const layers = /* @__PURE__ */ new Map();
    let scheduled = false;
    let sessionWorkspace = /* @__PURE__ */ new Map();
    const sync = () => {
      const rows = [
        ...document.querySelectorAll('[data-row-key^="workspace:"]')
      ];
      const workspaceIds = new Set(
        rows.map(
          (row) => row.getAttribute("data-row-key")?.slice("workspace:".length)
        ).filter(Boolean)
      );
      const activeGroups = state.groups.filter(
        (group) => workspaceIds.has(group.workspaceId)
      );
      const seen = /* @__PURE__ */ new Set();
      for (const row of rows) {
        const workspaceId = row.getAttribute("data-row-key")?.slice("workspace:".length);
        if (!workspaceId) continue;
        const groups = activeGroups.filter(
          (group) => group.workspaceId === workspaceId
        );
        const span = row.parentElement;
        const section = span?.parentElement;
        if (span === null || span === void 0 || section === null || section === void 0)
          continue;
        if (groups.length === 0) {
          const existing = layers.get(workspaceId);
          if (existing !== void 0) {
            existing.root.unmount();
            existing.container.remove();
            layers.delete(workspaceId);
          }
          continue;
        }
        let layer = layers.get(workspaceId);
        const created = layer === void 0 || !layer.container.isConnected;
        if (created) {
          if (layer !== void 0) {
            try {
              layer.root.unmount();
            } catch {
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
        } else if (layer.container.previousElementSibling !== span || layer.container.parentElement !== section) {
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
              locale
            })
          );
        }
        seen.add(workspaceId);
      }
      for (const [workspaceId, layer] of [...layers]) {
        if (seen.has(workspaceId)) continue;
        try {
          layer.root.unmount();
        } catch {
        }
        layer.container.remove();
        layers.delete(workspaceId);
      }
      const workspaceSnapshot = ctx.get("workspaces")?.list?.getSnapshot?.();
      const workspaceSessionSets = new Map(
        (workspaceSnapshot?.items ?? []).map((item) => [
          item.workspaceId,
          new Set(item.sessionIds)
        ])
      );
      sessionWorkspace = /* @__PURE__ */ new Map();
      for (const item of workspaceSnapshot?.items ?? []) {
        for (const sessionId of item.sessionIds)
          sessionWorkspace.set(sessionId, item.workspaceId);
      }
      const grouped = /* @__PURE__ */ new Set();
      for (const group of activeGroups) {
        if (!seen.has(group.workspaceId)) continue;
        const members = workspaceSessionSets.get(group.workspaceId);
        if (members === void 0) continue;
        for (const sessionId of group.sessionIds) {
          if (members.has(sessionId)) grouped.add(sessionId);
        }
      }
      for (const row of document.querySelectorAll(
        '[data-row-key^="session:"]'
      )) {
        const sessionId = row.getAttribute("data-row-key")?.slice("session:".length);
        const span = row.parentElement;
        if (span === null || span === void 0) continue;
        if (!row.hasAttribute("data-handy-draggable") && typeof sessionId === "string") {
          row.setAttribute("data-handy-draggable", "true");
          row.draggable = true;
          row.addEventListener("dragstart", (event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("button, a, input, textarea")) {
              event.preventDefault();
              return;
            }
            const id = row.getAttribute("data-row-key")?.slice("session:".length);
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
      attributeFilter: ["aria-expanded"]
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
        }
        layer.container.remove();
      }
      layers.clear();
    };
  }, "dsh-handy: sidebar session groups");
}
function installWorkspaceMenu(ctx, actions, t) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {
    };
    let scheduled = false;
    const sync = () => {
      const row = [
        ...document.querySelectorAll('[data-row-key^="workspace:"]')
      ].find((candidate) => String(candidate.className).includes("menuOpen"));
      if (row === void 0) return;
      const workspaceId = row.getAttribute("data-row-key")?.slice("workspace:".length);
      if (!workspaceId) return;
      const menus = [...document.querySelectorAll('[role="menu"]')].filter(
        (menu2) => !menu2.hasAttribute("data-handy-menu")
      );
      const menu = menus.at(-1);
      if (menu === void 0 || menu.querySelector("[data-handy-ws-menu]") !== null)
        return;
      const items = [...menu.querySelectorAll('[role="menuitem"]')];
      if (items.length === 0) return;
      const danger = items.some(
        (item) => String(item.className).includes("danger")
      );
      if (!danger) return;
      const firstWrap = items[0].parentElement;
      if (firstWrap === null) return;
      const clone = firstWrap.cloneNode(true);
      clone.setAttribute("data-handy-ws-menu", "true");
      const button = clone.querySelector('[role="menuitem"]');
      if (button === null) return;
      const spans = button.querySelectorAll("span");
      if (spans[0] !== void 0) {
        spans[0].innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke-width="1"><path d="M8 3v10M3 8h10" stroke="currentColor"/></svg>';
      }
      if (spans[spans.length - 1] !== void 0) {
        spans[spans.length - 1].textContent = t("groups.action");
      } else {
        button.textContent = t("groups.action");
      }
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const outsidePointer = typeof PointerEvent === "function" ? new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true
        }) : new MouseEvent("pointerdown", {
          bubbles: true,
          cancelable: true
        });
        document.body.dispatchEvent(outsidePointer);
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true
          })
        );
        globalThis.setTimeout(
          () => actions.promptCreateGroup(workspaceId, null),
          0
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
      attributeFilter: ["class", "aria-expanded"]
    });
    schedule();
    return () => observer.disconnect();
  }, "dsh-handy: workspace menu entry");
}

// src/workspace-sort.js
function installWorkspaceSort(ctx) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {
    };
    let scheduled = false;
    const readSnapshots = () => {
      const sessions2 = ctx.get("sessions");
      const workspaces2 = ctx.get("workspaces");
      const statuses = ctx.get("uiSession")?.sessionStatus?.getSnapshot?.() ?? /* @__PURE__ */ new Map();
      return {
        list: sessions2?.list?.getSnapshot?.(),
        workspaces: workspaces2?.list?.getSnapshot?.(),
        statuses
      };
    };
    const isRunning = (sessionId, list, statuses) => statuses.get(sessionId)?.running === true || list?.byId?.[sessionId]?.running === true;
    const sync = () => {
      const { list, workspaces: workspaces2, statuses } = readSnapshots();
      const workspaceItems = workspaces2?.items ?? [];
      for (const row of document.querySelectorAll(
        '[data-row-key^="session:"]'
      )) {
        const sessionId = row.getAttribute("data-row-key")?.slice("session:".length);
        if (typeof sessionId !== "string" || sessionId === "") continue;
        if (isRunning(sessionId, list, statuses)) {
          row.setAttribute("data-handy-running", "true");
        } else {
          row.removeAttribute("data-handy-running");
        }
      }
      const workspaceOrder = new Map(
        workspaceItems.map((item, position) => [item.workspaceId, position])
      );
      const groups = /* @__PURE__ */ new Map();
      let fallbackIndex = 0;
      for (const row of document.querySelectorAll(
        '[data-row-key^="workspace:"]'
      )) {
        const workspaceId = row.getAttribute("data-row-key")?.slice("workspace:".length);
        const section = row.parentElement?.parentElement;
        if (typeof workspaceId !== "string" || workspaceId === "" || section === null || section === void 0) {
          fallbackIndex += 1;
          continue;
        }
        const parent = section.parentElement;
        if (parent === null) {
          fallbackIndex += 1;
          continue;
        }
        const workspace = workspaceItems.find(
          (item) => item.workspaceId === workspaceId
        );
        const running = workspace?.sessionIds.some((id) => isRunning(id, list, statuses)) === true;
        const group = groups.get(parent) ?? [];
        group.push({
          section,
          running,
          index: workspaceOrder.get(workspaceId) ?? fallbackIndex
        });
        groups.set(parent, group);
        fallbackIndex += 1;
      }
      for (const entries of groups.values()) {
        const sorted = entries.slice().sort(
          (left, right) => Number(right.running) - Number(left.running) || left.index - right.index
        );
        if (entries.every((entry, position) => entry === sorted[position])) {
          continue;
        }
        const parent = entries[0].section.parentElement;
        if (parent === null) continue;
        const anchor = document.createComment("dsh-handy-workspace-order");
        parent.insertBefore(anchor, entries[0].section);
        for (const entry of sorted) parent.insertBefore(entry.section, anchor);
        anchor.remove();
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        sync();
      };
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(run);
      } else {
        globalThis.setTimeout(run, 16);
      }
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    const sessions = ctx.get("sessions");
    const workspaces = ctx.get("workspaces");
    const statusSource = ctx.get("uiSession")?.sessionStatus;
    const disposers = [
      sessions?.list?.subscribe?.(schedule),
      workspaces?.list?.subscribe?.(schedule),
      statusSource?.subscribe?.(schedule)
    ];
    schedule();
    return () => {
      observer.disconnect();
      for (const dispose of disposers) dispose?.();
      for (const row of document.querySelectorAll("[data-handy-running]")) {
        row.removeAttribute("data-handy-running");
      }
    };
  }, "dsh-handy: running workspace order");
}

// src/fork-copy.js
var WRAPPED = Symbol("dsh-handy.fork-copy");
function installForkCopy(ctx, actions) {
  return ctx.inject(
    ["sessions"],
    (serviceCtx) => serviceCtx.effect(() => {
      const sessions = serviceCtx.get("sessions");
      const original = sessions?.fork;
      if (typeof original !== "function") return () => {
      };
      if (original[WRAPPED] === true) return () => {
      };
      const wrapped = async function forkWithHandyData(opts) {
        const sourceId = typeof opts?.sessionId === "string" ? opts.sessionId : void 0;
        const copy = (childId2) => {
          if (typeof childId2 === "string" && childId2 !== "" && sourceId !== void 0) {
            actions.copySessionHandyData(sourceId, childId2);
          }
        };
        const originalOnCreated = opts?.onCreated;
        const next = typeof originalOnCreated === "function" ? {
          ...opts,
          onCreated: (childId2) => {
            copy(childId2);
            originalOnCreated(childId2);
          }
        } : opts;
        const childId = await original.call(this, next);
        copy(childId);
        return childId;
      };
      wrapped[WRAPPED] = true;
      try {
        sessions.fork = wrapped;
      } catch (error) {
        console.warn("dsh-handy: cannot wrap session fork", error);
        return () => {
        };
      }
      return () => {
        if (sessions.fork === wrapped) sessions.fork = original;
      };
    }, "dsh-handy: fork data copy")
  );
}

// src/plugin.js
function apply(ctx) {
  injectStyle();
  const t = ctx.locale.bind(NS);
  const locale = (ctx.locale.getLocale?.().active ?? "zh") === "en" ? "en" : "zh";
  setHandyT(t);
  const actions = makeActions(ctx, t, locale);
  ctx.effect(
    () => ctx.locale.register(NS, { zh: zhMessages, en: enMessages }),
    "dsh-handy: dictionaries"
  );
  installHighlightObserver(ctx);
  installStorageSync(ctx);
  installGroupSidebar(ctx, actions, t, locale);
  installWorkspaceMenu(ctx, actions, t);
  installWorkspaceSort(ctx);
  installForkCopy(ctx, actions);
  ctx.effect(
    () => () => {
      closeActiveMenu();
      for (const node of document.querySelectorAll("[data-handy-modal]"))
        node.remove();
    },
    "dsh-handy: transient overlay cleanup"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "conversation.view",
      () => ctx.slots.register(
        {
          name: "conversation.view",
          id: "handy-notebook",
          order: 30,
          label: () => t("notebook.tab"),
          locale: NS,
          inject: (sessionId) => ({
            handyActions: actions,
            handySessionId: sessionId
          })
        },
        NotebookView
      )
    ),
    "dsh-handy: conversation notebook view"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "sidebar.workspaces.session.row.action",
      () => ctx.slots.register(
        {
          name: "sidebar.workspaces.session.row.action",
          id: "handy-star",
          order: 210,
          inject: () => ({ store, actions, t })
        },
        StarButton
      )
    ),
    "dsh-handy: session star action"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "sidebar.workspaces.session.menu.item",
      function* registerMenu() {
        yield ctx.slots.register(
          {
            name: "sidebar.workspaces.session.menu.item",
            id: "handy-highlight",
            order: 500,
            inject: () => ({ store, actions, t })
          },
          HighlightMenuItem
        );
        yield ctx.slots.register(
          {
            name: "sidebar.workspaces.session.menu.item",
            id: "handy-group",
            order: 510,
            inject: () => ({ store, actions, t })
          },
          GroupMenuItem
        );
      }
    ),
    "dsh-handy: session menu entries"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "sidebar.right.tab.menu.item",
      function* registerTabMenu() {
        const modes = [
          ["handy-close-current", "current", 1001],
          ["handy-close-left", "left", 1002],
          ["handy-close-right", "right", 1003],
          ["handy-close-all", "all", 1004]
        ];
        for (const [id, mode, order] of modes) {
          yield ctx.slots.register(
            {
              name: "sidebar.right.tab.menu.item",
              id,
              order,
              inject: () => ({ store, t })
            },
            (props) => h(TabMenuAction, { ...props, mode, store, t })
          );
        }
      }
    ),
    "dsh-handy: file tab menu entries"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "conversation.session.header.utilities",
      () => ctx.slots.register(
        {
          name: "conversation.session.header.utilities",
          id: "handy-key-info",
          order: 60,
          inject: (sessionId) => ({ sessionId, handyActions: actions, t })
        },
        KeyInfoPanel
      )
    ),
    "dsh-handy: key information panel"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "shell.overlay",
      () => ctx.slots.register(
        {
          name: "shell.overlay",
          id: "handy-toast",
          inject: () => ({ store, actions, t })
        },
        HandyToast
      )
    ),
    "dsh-handy: toast overlay"
  );
  ctx.inject(["sidebarRight"], (serviceCtx) => {
    const controller = serviceCtx.get("sidebarRight");
    globalThis.__dshHandySidebarRight = controller;
    serviceCtx.effect(() => {
      globalThis.__dshHandySidebarRight = controller;
      return () => {
        if (globalThis.__dshHandySidebarRight === controller) {
          delete globalThis.__dshHandySidebarRight;
        }
      };
    }, "dsh-handy: sidebar controller bridge");
  });
  ctx.inject(["commandUi"], (commandCtx) => {
    commandCtx.effect(() => {
      try {
        return commandCtx.commandUi.register({
          name: "fork",
          label: () => t("fork.title"),
          description: () => t("fork.description"),
          available: (session) => {
            const sessionId = session?.sessionId ?? session?.session?.sessionId;
            if (typeof sessionId !== "string" || sessionId === "") return false;
            return ctx.get("sessions")?.subagentAddress?.(sessionId) === void 0;
          },
          ui: {
            kind: "popupSelect",
            searchMode: "fuzzy-label",
            searchLabels: () => ({
              placeholder: t("fork.search"),
              empty: t("fork.empty"),
              noResults: t("fork.noResults")
            }),
            options: async (context, signal) => {
              signal?.throwIfAborted?.();
              const sessionId = context?.sessionId ?? context?.session?.sessionId;
              if (typeof sessionId !== "string") return [];
              const entries = context?.eventSource?.getSnapshot?.().entries ?? readEntries(ctx, sessionId);
              const turns = forkableTurns(entries).slice().reverse();
              return turns.map((row) => ({
                id: `turn:${row.turn}`,
                label: `${fmt(t, "fork.option", { n: row.turn })} \xB7 ${excerpt(row.prompt || row.reply, 64) || t("fork.turnEmpty")}`,
                detail: fmt(
                  t,
                  row.completed ? "fork.optionDetail" : "fork.optionRunning",
                  {
                    time: formatTime(row.time, locale)
                  }
                ),
                seq: row.endSeq ?? row.lastSeq ?? row.startSeq,
                turn: row.turn,
                group: { name: "turns", label: t("fork.group") }
              }));
            },
            onSelect: async (option, context) => {
              const sessionId = context?.sessionId ?? context?.session?.sessionId;
              if (typeof sessionId !== "string") return;
              try {
                const childId = await ctx.get("sessions").fork({
                  sessionId,
                  atSeq: option.seq,
                  increaseTitle: true
                });
                actions.copySessionHandyData(sessionId, childId);
                actions.recordFork(childId, sessionId, option.seq, option.turn);
                actions.say("toast.forkCreated", { n: option.turn });
                actions.openSession(childId);
              } catch (error) {
                actions.say(
                  "toast.forkFailed",
                  {
                    message: error instanceof Error ? error.message : String(error)
                  },
                  "error"
                );
              }
            }
          }
        });
      } catch (error) {
        console.warn("dsh-handy: /fork registration failed", error);
        return () => {
        };
      }
    }, "dsh-handy: /fork command");
  });
}

// src/client.js
var name = "dsh-handy";
var inject = ["slots", "locale"];

    return module.exports;
  },
});
