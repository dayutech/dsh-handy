/** Locale dictionaries and message formatting. */
const zh = {
  common: {
    current: "当前会话",
    all: "全部会话",
    cancel: "取消",
    close: "关闭",
    copy: "复制",
    copied: "已复制",
    delete: "删除",
    open: "打开",
    rename: "重命名",
    save: "保存",
    search: "搜索",
    noSession: "未选择会话",
    untitled: "未命名会话",
    sessions: "个会话",
    turn: "第 {n} 轮",
    loading: "加载中…",
    retry: "重试",
  },
  groups: {
    action: "新增会话组",
    createTitle: "新增会话组",
    createChildTitle: "新增子会话组",
    createDescription: "会话组只存在于当前工作区，最多嵌套 3 级。",
    createChildDescription: "在「{name}」下新建子会话组。",
    namePlaceholder: "会话组名称，例如：支付改造",
    create: "创建",
    createAndAdd: "新建并加入",
    pickGroup: "加入会话组",
    pickGroupDescription: "选择当前工作区下的会话组，也可以新建并加入。",
    pickSessionTitle: "添加会话到会话组",
    addSession: "添加会话到会话组",
    addSessionTitle: "添加会话",
    addSessionDescription: "选择要移入「{name}」的会话。",
    newSession: "创建会话",
    newChild: "新建子会话组",
    deleteGroup: "删除会话组",
    deleteTitle: "删除会话组？",
    deleteDescription:
      "只会删除会话组，不会删除会话；组内会话会移到上一层或未分组。",
    deleteNestedDescription:
      "「{name}」及 {n} 个子组会被删除；组内会话会移到上一层或未分组。",
    renameTitle: "重命名会话组",
    moveSession: "移动到其他会话组",
    removeSession: "移出会话组",
    sessionCount: "{n} 个会话",
    emptyName: "会话组名称不能为空。",
    duplicate: "同一层已存在同名会话组。",
    depthLimit: "会话组最多嵌套 3 级。",
    crossWorkspace: "会话与会话组必须属于同一工作区。",
    noWorkspace: "当前会话不在任何工作区中。",
    noUngroupedSessions: "当前工作区没有可添加的会话。",
    createSessionFailed: "创建会话失败：{message}",
    groupMenu: "会话组操作",
    sessionMenu: "会话操作",
    count: "{n}",
  },
  tree: {
    viewTab: "会话树",
    workspace: "工作区：{name}",
    sessionCount: "{n} 个会话",
    emptyWorkspace: "当前工作区还没有会话。",
    noWorkspace: "当前会话不属于任何工作区。",
    currentTag: "当前",
    important: "重要会话",
    branchCount: "{n} 个分支",
    forkedFrom: "分叉自「{name}」",
    forkedAt: "分叉自「{name}」第 {n} 轮",
    parentOutside: "来源会话在其他工作区",
    legendView:
      "每个节点是当前工作区的一个会话；缩进和连线表示分叉关系。点击节点打开会话。",
    turnPromptEmpty: "（无文本输入）",
  },
  row: {
    highlight: "标记为重要会话",
    unhighlight: "取消重要标记",
    important: "重要会话",
  },
  menu: {
    highlight: "标记为重要",
    unhighlight: "取消重要标记",
    addGroup: "加入会话组…",
    separator: "快捷操作",
  },
  file: {
    closeCurrent: "关闭当前标签页",
    closeLeft: "关闭左侧所有标签页",
    closeRight: "关闭右侧所有标签页",
    closeAll: "关闭所有标签页",
  },
  fork: {
    title: "从指定轮次分叉",
    description: "选择一轮用户输入，从该轮完整对话之后创建新分支",
    group: "用户轮次",
    search: "搜索轮次内容…",
    empty: "当前会话还没有可用的用户轮次，暂时无法分叉。",
    noResults: "没有匹配的轮次。",
    option: "第 {n} 轮",
    optionDetail: "{time} · 完整轮次",
    optionRunning: "{time} · 进行中，从当前进度分叉",
    pending: "正在创建分支…",
    created: "已从第 {n} 轮创建分支",
    failed: "分叉失败：{message}",
    openChild: "已打开新分支",
  },
  cmd: {
    fork: "从指定轮次分叉",
  },
  toast: {
    forkCreated: "已从第 {n} 轮创建分支",
    forkOpened: "已打开新分支",
    forkFailed: "分叉失败：{message}",
    groupAdded: "已加入「{name}」",
    groupRemoved: "已移出会话组",
    groupCreated: "已创建会话组「{name}」",
    groupDeleted: "已删除会话组",
    highlightOn: "已标记为重要会话",
    highlightOff: "已取消重要标记",
    copied: "已复制",
    copyFailed: "复制失败",
  },
};

const en = {
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
    loading: "Loading…",
    retry: "Retry",
  },
  groups: {
    action: "New session group",
    createTitle: "New session group",
    createChildTitle: "New child group",
    createDescription:
      "A group belongs to the current workspace and nests at most three levels.",
    createChildDescription: "Create a child group under “{name}”.",
    namePlaceholder: "Group name, e.g. Payments refactor",
    create: "Create",
    createAndAdd: "Create and add",
    pickGroup: "Add to session group",
    pickGroupDescription:
      "Pick a group in the current workspace, or create one and add the session.",
    pickSessionTitle: "Add a session to this group",
    addSession: "Add session to group",
    addSessionTitle: "Add session",
    addSessionDescription: "Choose a session to move into “{name}”.",
    newSession: "Create session",
    newChild: "New child group",
    deleteGroup: "Delete session group",
    deleteTitle: "Delete session group?",
    deleteDescription:
      "Only the group is removed. Its sessions move up one level or become ungrouped.",
    deleteNestedDescription:
      "“{name}” and {n} child groups will be removed. Their sessions move up one level or become ungrouped.",
    renameTitle: "Rename session group",
    moveSession: "Move to another group",
    removeSession: "Remove from group",
    sessionCount: "{n} sessions",
    emptyName: "Group name cannot be empty.",
    duplicate: "A group with that name already exists at this level.",
    depthLimit: "Session groups nest at most three levels.",
    crossWorkspace:
      "A session and its group must belong to the same workspace.",
    noWorkspace: "This session is not in any workspace.",
    noUngroupedSessions: "This workspace has no sessions available to add.",
    createSessionFailed: "Could not create the session: {message}",
    groupMenu: "Group actions",
    sessionMenu: "Session actions",
    count: "{n}",
  },
  tree: {
    viewTab: "Session tree",
    workspace: "Workspace: {name}",
    sessionCount: "{n} sessions",
    emptyWorkspace: "This workspace has no sessions yet.",
    noWorkspace: "This session is not in any workspace.",
    currentTag: "Current",
    important: "Important session",
    branchCount: "{n} branches",
    forkedFrom: "Forked from “{name}”",
    forkedAt: "Forked from “{name}” at turn {n}",
    parentOutside: "Source session is in another workspace",
    legendView:
      "Each node is a session in this workspace; indentation and lines show fork ancestry. Click a node to open the session.",
    turnPromptEmpty: "(no text input)",
  },
  row: {
    highlight: "Mark as important",
    unhighlight: "Remove important mark",
    important: "Important session",
  },
  menu: {
    highlight: "Mark as important",
    unhighlight: "Remove important mark",
    addGroup: "Add to session group…",
    separator: "Quick actions",
  },
  file: {
    closeCurrent: "Close current tab",
    closeLeft: "Close all tabs to the left",
    closeRight: "Close all tabs to the right",
    closeAll: "Close all tabs",
  },
  fork: {
    title: "Fork from a turn",
    description: "Pick a user turn and branch after that complete exchange",
    group: "User turns",
    search: "Search turn text…",
    empty: "This session has no user turns to fork from yet.",
    noResults: "No matching turns.",
    option: "Turn {n}",
    optionDetail: "{time} · complete turn",
    optionRunning: "{time} · in progress, branches from current point",
    pending: "Creating branch…",
    created: "Created a branch from turn {n}",
    failed: "Fork failed: {message}",
    openChild: "Opened the new branch",
  },
  cmd: {
    fork: "Fork from a turn",
  },
  toast: {
    forkCreated: "Created a branch from turn {n}",
    forkOpened: "Opened the new branch",
    forkFailed: "Fork failed: {message}",
    groupAdded: "Added to “{name}”",
    groupRemoved: "Removed from session group",
    groupCreated: "Created session group “{name}”",
    groupDeleted: "Session group deleted",
    highlightOn: "Marked as important",
    highlightOff: "Important mark removed",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
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

const zhMessages = flattenMessages(zh);
const enMessages = flattenMessages(en);

function fmt(t, key, vars) {
  let value = t(key);
  if (vars === undefined) return value;
  for (const [name, replacement] of Object.entries(vars)) {
    value = String(value).split(`{${name}}`).join(String(replacement));
  }
  return value;
}

export { zh, en, zhMessages, enMessages, flattenMessages, fmt };
