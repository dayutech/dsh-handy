/** Floating, draggable, per-session key/value information panel. */
import { h, useEffect, useRef, useState } from "./runtime.js";
import { useHandy } from "./state.js";
import { fmt } from "./i18n.js";

const DEFAULT_PANEL = { right: 16, top: 88 };
const PANEL_WIDTH = 332;
const BADGE_WIDTH = 48;

function KeyGlyph() {
  return h(
    "svg",
    {
      width: 15,
      height: 15,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
    },
    h("circle", {
      cx: 5.2,
      cy: 10.8,
      r: 2.7,
      stroke: "currentColor",
      strokeWidth: 1.2,
    }),
    h("path", {
      d: "M7.2 8.8 13 3m-2.3.2 2.2 2.2M8.9 5.1 10.7 7",
      stroke: "currentColor",
      strokeWidth: 1.2,
      strokeLinecap: "round",
    }),
  );
}

function ChevronGlyph({ collapsed }) {
  return h(
    "svg",
    {
      className: "hy-key-chevron-svg",
      width: 12,
      height: 12,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      "data-collapsed": collapsed ? "true" : "false",
    },
    h("path", {
      d: "m3.5 6 4.5 4.5L12.5 6",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }),
  );
}

function buildInjection(items, t) {
  const lines = [t("keyInfo.injectPreamble")];
  for (const item of items) {
    const name =
      item.name.trim() === "" ? t("keyInfo.untitled") : item.name.trim();
    const value = item.value.trim();
    if (value === "") continue;
    lines.push(fmt(t, "keyInfo.injectItem", { name, value }));
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
    const width = globalThis.innerWidth ?? 1200;
    const height = globalThis.innerHeight ?? 800;
    return { left: 0, top: 0, right: width, bottom: height };
  }
  // The `main.conversation` slot wrapper can be `display: contents` with a
  // zero rect. The center column is the real area that shrinks when the right
  // sidebar opens, so anchor to it first.
  const element =
    anchor?.closest?.('[class*="centerCol"]') ??
    document.querySelector('[class*="centerCol"]') ??
    document.querySelector('[data-slot="main.conversation"]') ??
    document.querySelector('[data-slot="conversation.view"]');
  if (element !== null) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  const width = globalThis.innerWidth ?? 1200;
  const height = globalThis.innerHeight ?? 800;
  return { left: 0, top: 0, right: width, bottom: height };
}

export function KeyInfoPanel({ sessionId, handyActions, t }) {
  const state = useHandy();
  const sid = sessionId;
  const entry =
    sid === undefined
      ? undefined
      : (state.keyInfo?.[sid] ?? {
          collapsed: true,
          items: [],
          panel: DEFAULT_PANEL,
        });
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
    const area =
      panelRef.current?.closest('[class*="centerCol"]') ??
      document.querySelector('[class*="centerCol"]');
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
      `[data-key-id="${focusId}"] input`,
    );
    node?.focus?.();
    setFocusId(null);
  }, [focusId]);

  useEffect(
    () => () => {
      dragRef.current?.cleanup?.();
    },
    [],
  );

  if (sid === undefined || entry === undefined) return null;

  const items = entry.items;
  const complete = items.filter((item) => item.value.trim() !== "");
  const count = items.length;
  const panel = entry.panel ?? DEFAULT_PANEL;
  const width =
    size.width > 0 ? size.width : entry.collapsed ? BADGE_WIDTH : PANEL_WIDTH;
  const height = size.height > 0 ? size.height : entry.collapsed ? 32 : 360;
  const left = clamp(
    bounds.right - width - (panel.right ?? 16),
    bounds.left + 8,
    Math.max(bounds.left + 8, bounds.right - width - 8),
  );
  const top = clamp(
    bounds.top + (panel.top ?? 88),
    bounds.top + 8,
    Math.max(bounds.top + 8, bounds.bottom - height - 8),
  );
  const position = dragPos ?? { left, top };

  const add = (seed = {}) => {
    const id = handyActions?.addKeyInfoItem(sid, seed);
    if (typeof id === "string") setFocusId(id);
  };

  const startDrag = (event, options = {}) => {
    const fromBadge = options.fromBadge === true;
    if (fromBadge ? event.button !== 2 : event.button !== 0) return;
    const target = event.target;
    if (
      !fromBadge &&
      target instanceof Element &&
      target.closest("button, input, textarea, select")
    ) {
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
      cleanup: null,
    };
    const move = (moveEvent) => {
      const nextLeft = clamp(
        drag.startLeft + moveEvent.clientX - drag.startX,
        area.left + 8,
        Math.max(area.left + 8, area.right - drag.width - 8),
      );
      const nextTop = clamp(
        drag.startTop + moveEvent.clientY - drag.startY,
        area.top + 8,
        Math.max(area.top + 8, area.bottom - drag.height - 8),
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
        top: Math.max(0, drag.latest.top - drag.area.top),
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
        onClick: () => handyActions?.setKeyInfoCollapsed(sid, false),
        onPointerDown: (event) => startDrag(event, { fromBadge: true }),
        onContextMenu: (event) => event.preventDefault(),
      },
      h(KeyGlyph),
      count > 0
        ? h("span", { className: "hy-key-badge-count" }, String(count))
        : null,
    );
  }

  const presets = [
    {
      key: "target",
      label: t("keyInfo.presetTarget"),
      seed: { name: t("keyInfo.presetTarget") },
    },
    {
      key: "ssh",
      label: t("keyInfo.presetSsh"),
      seed: { name: t("keyInfo.presetSsh") },
    },
    {
      key: "web",
      label: t("keyInfo.presetWeb"),
      seed: { name: t("keyInfo.presetWeb") },
    },
    {
      key: "db",
      label: t("keyInfo.presetDb"),
      seed: { name: t("keyInfo.presetDb") },
    },
  ];

  const injectItems = async (subset) => {
    const ready = subset.filter((item) => item.value.trim() !== "");
    if (ready.length === 0) {
      handyActions?.say("keyInfo.noItems", undefined, "error");
      return;
    }
    setSending(true);
    try {
      await handyActions?.sendKeyInfo(sid, buildInjection(ready, t));
    } finally {
      setSending(false);
    }
  };

  const inject = () => injectItems(items);
  const injectItem = (item) => {
    if (item.value.trim() === "") {
      handyActions?.say("keyInfo.noItems", undefined, "error");
      return;
    }
    void injectItems([item]);
  };

  return h(
    "aside",
    {
      className: "hy-key-panel",
      ref: panelRef,
      style: { left: `${position.left}px`, top: `${position.top}px` },
      "data-handy-key-info": "true",
      "data-handy-dragging": dragPos === null ? undefined : "true",
      "aria-label": t("keyInfo.title"),
    },
    h(
      "div",
      {
        className: "hy-key-head",
        onPointerDown: startDrag,
        onDoubleClick: (event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("button, input, textarea, select")
          ) {
            return;
          }
          handyActions?.setKeyInfoPanelPos(sid, DEFAULT_PANEL);
        },
      },
      h("span", { className: "hy-key-head-icon" }, h(KeyGlyph)),
      h(
        "span",
        { className: "hy-key-head-copy" },
        h("span", { className: "hy-key-head-title" }, t("keyInfo.title")),
        h(
          "span",
          { className: "hy-key-head-count" },
          fmt(t, "keyInfo.count", { n: count }),
        ),
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-key-hide",
          title: t("keyInfo.hide"),
          "aria-label": t("keyInfo.hide"),
          onClick: () => handyActions?.setKeyInfoCollapsed(sid, true),
        },
        "×",
      ),
    ),
    h(
      "div",
      { className: "hy-key-body" },
      items.length === 0
        ? h("div", { className: "hy-key-empty" }, t("keyInfo.empty"))
        : h(
            "div",
            { className: "hy-key-tools" },
            h(
              "button",
              {
                type: "button",
                className: "hy-key-tool",
                onClick: () =>
                  handyActions?.setAllKeyInfoItemsCollapsed(sid, true),
              },
              t("keyInfo.collapseAll"),
            ),
            h(
              "button",
              {
                type: "button",
                className: "hy-key-tool",
                onClick: () =>
                  handyActions?.setAllKeyInfoItemsCollapsed(sid, false),
              },
              t("keyInfo.expandAll"),
            ),
          ),
      items.map((item) =>
        h(
          "div",
          {
            className: "hy-key-item",
            key: item.id,
            "data-key-id": item.id,
            "data-collapsed": item.collapsed ? "true" : "false",
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
                  item.collapsed ? "keyInfo.expand" : "keyInfo.collapse",
                ),
                "aria-label": t(
                  item.collapsed ? "keyInfo.expand" : "keyInfo.collapse",
                ),
                "aria-expanded": item.collapsed !== true,
                onClick: () =>
                  handyActions?.setKeyInfoItemCollapsed(
                    sid,
                    item.id,
                    item.collapsed !== true,
                  ),
              },
              h(ChevronGlyph, { collapsed: item.collapsed }),
            ),
            item.collapsed
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "hy-key-summary",
                    onClick: () =>
                      handyActions?.setKeyInfoItemCollapsed(
                        sid,
                        item.id,
                        false,
                      ),
                  },
                  item.name.trim() === "" ? t("keyInfo.untitled") : item.name,
                )
              : h("input", {
                  className: "hy-key-name",
                  value: item.name,
                  placeholder: t("keyInfo.namePlaceholder"),
                  "aria-label": t("keyInfo.namePlaceholder"),
                  onChange: (event) =>
                    handyActions?.updateKeyInfoItem(sid, item.id, {
                      name: event.target.value,
                    }),
                }),
            h(
              "span",
              { className: "hy-key-item-actions" },
              h(
                "button",
                {
                  type: "button",
                  className: "hy-key-mini hy-key-inject-one",
                  title: t("keyInfo.injectOne"),
                  "aria-label": t("keyInfo.injectOne"),
                  disabled: sending || item.value.trim() === "",
                  onClick: () => injectItem(item),
                },
                "↗",
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "hy-key-mini",
                  title: t("keyInfo.copy"),
                  "aria-label": t("keyInfo.copy"),
                  onClick: () => handyActions?.copy(item.value),
                },
                "⧉",
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "hy-key-mini hy-key-remove",
                  title: t("keyInfo.remove"),
                  "aria-label": t("keyInfo.remove"),
                  onClick: () => handyActions?.removeKeyInfoItem(sid, item.id),
                },
                "×",
              ),
            ),
          ),
          item.collapsed
            ? null
            : h(
                "div",
                { className: "hy-key-item-body" },
                h("textarea", {
                  className: "hy-key-value",
                  value: item.value,
                  rows: 2,
                  placeholder: t("keyInfo.valuePlaceholder"),
                  "aria-label": t("keyInfo.valuePlaceholder"),
                  spellCheck: false,
                  onChange: (event) =>
                    handyActions?.updateKeyInfoItem(sid, item.id, {
                      value: event.target.value,
                    }),
                }),
                h("input", {
                  className: "hy-key-note",
                  value: item.note,
                  placeholder: t("keyInfo.notePlaceholder"),
                  "aria-label": t("keyInfo.notePlaceholder"),
                  onChange: (event) =>
                    handyActions?.updateKeyInfoItem(sid, item.id, {
                      note: event.target.value,
                    }),
                }),
              ),
        ),
      ),
      h(
        "div",
        { className: "hy-key-presets" },
        h(
          "span",
          { className: "hy-key-presets-label" },
          t("keyInfo.addPreset"),
        ),
        presets.map((preset) =>
          h(
            "button",
            {
              type: "button",
              className: "hy-key-preset",
              key: preset.key,
              onClick: () => add(preset.seed),
            },
            preset.label,
          ),
        ),
      ),
      h(
        "button",
        {
          type: "button",
          className: "hy-key-add",
          onClick: () => add({}),
        },
        `＋ ${t("keyInfo.add")}`,
      ),
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
          onClick: inject,
        },
        sending ? t("keyInfo.injecting") : t("keyInfo.inject"),
      ),
      h("span", { className: "hy-key-local" }, t("keyInfo.localOnly")),
    ),
  );
}
