/** Session-summary and event/turn helpers. */
function currentSessionId(list) {
  if (list === null || typeof list !== "object") return undefined;
  return Object.values(list.byId ?? {}).find(
    (row) => (row.retainedBy?.mainView ?? 0) > 0,
  )?.id;
}

function sessionTitle(summary, t) {
  const title =
    typeof summary?.displayTitle === "string" &&
    summary.displayTitle.trim() !== ""
      ? summary.displayTitle.trim()
      : typeof summary?.title === "string" && summary.title.trim() !== ""
        ? summary.title.trim()
        : "";
  return title === "" ? t("common.untitled") : title;
}

function basename(path) {
  if (typeof path !== "string" || path === "") return "";
  const normalized = path.replace(/[/\\]+$/, "");
  const index = Math.max(
    normalized.lastIndexOf("/"),
    normalized.lastIndexOf("\\"),
  );
  return index < 0 ? normalized : normalized.slice(index + 1);
}

function excerpt(text, max = 72) {
  const clean = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean === "") return "";
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function formatTime(ms, locale) {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en" : "zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
    if (
      block.type === "text" &&
      typeof block.text === "string" &&
      block.text.trim() !== ""
    ) {
      parts.push(block.text);
    }
  }
  return parts.join("\n").trim();
}

function eventOf(entry) {
  if (entry === null || typeof entry !== "object") return undefined;
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

  const turns = new Map();
  let currentTurn = null;
  let pendingPrompts = [];
  let forkCut = null;

  const ensure = (number) => {
    let row = turns.get(number);
    if (row === undefined) {
      row = {
        turn: number,
        prompt: "",
        reply: "",
        startSeq: null,
        endSeq: null,
        lastSeq: null,
        completed: false,
        time: null,
      };
      turns.set(number, row);
    }
    return row;
  };

  for (const event of events) {
    if (
      event.type === "session/end-seed" &&
      event.data?.inherited === true &&
      forkCut === null
    ) {
      forkCut = event.seq > 0 ? event.seq - 1 : 0;
    }
    if (event.type === "user/message") {
      const source = event.data?.source;
      if (source !== undefined && source !== null && source.kind !== "user")
        continue;
      const text = textOfContent(event.data?.content);
      if (text === "") continue;
      if (currentTurn !== null) {
        const row = ensure(currentTurn);
        row.prompt = row.prompt === "" ? text : `${row.prompt}\n${text}`;
        row.time ??= event.time;
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
      row.startSeq ??= event.seq;
      row.time ??= event.time;
      if (pendingPrompts.length > 0) {
        row.prompt = pendingPrompts.map((item) => item.text).join("\n");
        row.time = pendingPrompts[0].time ?? row.time;
        row.lastSeq = Math.max(
          row.lastSeq ?? 0,
          ...pendingPrompts.map((item) => item.seq),
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
          ...pendingPrompts.map((item) => item.seq),
        );
        pendingPrompts = [];
      }
      const text = textOfContent(event.data?.message?.content);
      if (text !== "")
        row.reply = row.reply === "" ? text : `${row.reply}\n${text}`;
      row.lastSeq = event.seq;
      row.time ??= event.time;
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
    row.prompt = [row.prompt, ...pendingPrompts.map((item) => item.text)]
      .filter(Boolean)
      .join("\n");
    row.lastSeq = Math.max(
      row.lastSeq ?? 0,
      ...pendingPrompts.map((item) => item.seq),
    );
  }

  const result = [...turns.values()]
    .filter(
      (row) =>
        row.startSeq !== null ||
        row.completed ||
        row.prompt !== "" ||
        row.reply !== "",
    )
    .sort((left, right) => left.turn - right.turn);
  return { turns: result, forkCut };
}

function forkableTurns(entries) {
  return parseTurns(entries).turns.filter((row) => {
    if (row.prompt === "" && row.reply === "") return false;
    return (
      Number.isSafeInteger(row.endSeq) ||
      Number.isSafeInteger(row.lastSeq) ||
      Number.isSafeInteger(row.startSeq)
    );
  });
}

function readEntries(ctx, sessionId) {
  const binding = ctx.get("sessions")?.binding(sessionId);
  return binding?.eventSource?.getSnapshot?.()?.entries;
}

async function loadTurns(ctx, sessionId) {
  const direct = readEntries(ctx, sessionId);
  if (Array.isArray(direct) && direct.length > 0) return parseTurns(direct);
  const sessions = ctx.get("sessions");
  if (sessions?.using === undefined) return { turns: [], forkCut: null };
  try {
    return await sessions.using(
      sessionId,
      { source: "handyTree" },
      async (reference) => {
        const entries =
          reference?.binding?.eventSource?.getSnapshot?.()?.entries;
        return parseTurns(entries);
      },
    );
  } catch (error) {
    return { turns: [], forkCut: null, error };
  }
}

function familyOf(list, focusSessionId) {
  const byId = list?.byId ?? {};
  if (
    typeof focusSessionId !== "string" ||
    byId[focusSessionId] === undefined
  ) {
    return { rootId: undefined, ids: [] };
  }
  let rootId = focusSessionId;
  const seen = new Set([rootId]);
  while (typeof byId[rootId]?.parentSessionId === "string") {
    const parent = byId[rootId].parentSessionId;
    if (parent === rootId || seen.has(parent) || byId[parent] === undefined)
      break;
    seen.add(parent);
    rootId = parent;
  }
  const children = new Map();
  for (const row of Object.values(byId)) {
    if (row === null || typeof row !== "object") continue;
    if (row.origin === "subagent") continue;
    const parent = row.parentSessionId;
    if (typeof parent !== "string" || parent === "") continue;
    const bucket = children.get(parent) ?? [];
    bucket.push(row.id);
    children.set(parent, bucket);
  }
  const ids = [];
  const queue = [rootId];
  const visited = new Set();
  while (queue.length > 0 && ids.length < 40) {
    const id = queue.shift();
    if (typeof id !== "string" || visited.has(id) || byId[id] === undefined)
      continue;
    visited.add(id);
    ids.push(id);
    for (const child of children.get(id) ?? []) queue.push(child);
  }
  return { rootId, ids };
}

export {
  currentSessionId,
  sessionTitle,
  basename,
  excerpt,
  formatTime,
  textOfContent,
  eventOf,
  parseTurns,
  forkableTurns,
  readEntries,
  loadTurns,
  familyOf,
};
