/** Browser plugin wiring: slots, commands, observers, and handlers. */
import { h, NS, setActiveCtx, setHandyT } from "./runtime.js";
import { store } from "./state.js";
import { zhMessages, enMessages, fmt } from "./i18n.js";
import { makeActions } from "./actions.js";
import { injectStyle } from "./styles.js";
import { closeActiveMenu } from "./overlays.js";
import {
  StarButton,
  HighlightMenuItem,
  installHighlightObserver,
  installStorageSync,
} from "./highlight.js";
import { GroupMenuItem } from "./menu-items.js";
import { FileTabMenuAction } from "./file-tabs.js";
import { HandyToast } from "./toast.js";
import { ConversationTreeView } from "./tree.js";
import { installGroupSidebar, installWorkspaceMenu } from "./groups.js";
import { forkableTurns, readEntries, formatTime, excerpt } from "./session.js";
function apply(ctx) {
  injectStyle();
  const t = ctx.locale.bind(NS);
  const locale =
    (ctx.locale.getLocale?.().active ?? "zh") === "en" ? "en" : "zh";
  setHandyT(t);
  setActiveCtx(ctx);
  const actions = makeActions(ctx, t, locale);

  ctx.effect(
    () => ctx.locale.register(NS, { zh: zhMessages, en: enMessages }),
    "dsh-handy: dictionaries",
  );
  installHighlightObserver(ctx);
  installStorageSync(ctx);
  installGroupSidebar(ctx, actions, t, locale);
  installWorkspaceMenu(ctx, actions, t);
  ctx.effect(
    () => () => {
      closeActiveMenu();
      for (const node of document.querySelectorAll("[data-handy-modal]"))
        node.remove();
    },
    "dsh-handy: transient overlay cleanup",
  );

  // The workspace session tree lives beside "对话" and "轨迹" as a
  // conversation view tab, rather than in a separate sidebar panel.
  ctx.effect(
    () =>
      ctx.slots.inject("conversation.view", () =>
        ctx.slots.register(
          {
            name: "conversation.view",
            id: "handy-tree",
            order: 30,
            label: () => t("tree.viewTab"),
            locale: NS,
            inject: (sessionId) => ({
              handyActions: actions,
              handySessionId: sessionId,
            }),
          },
          ConversationTreeView,
        ),
      ),
    "dsh-handy: conversation tree view",
  );

  // Session row star button.
  ctx.effect(
    () =>
      ctx.slots.inject("sidebar.workspaces.session.row.action", () =>
        ctx.slots.register(
          {
            name: "sidebar.workspaces.session.row.action",
            id: "handy-star",
            order: 210,
            inject: () => ({ store, actions, t }),
          },
          StarButton,
        ),
      ),
    "dsh-handy: session star action",
  );

  // Session row "..." menu entries.
  ctx.effect(
    () =>
      ctx.slots.inject(
        "sidebar.workspaces.session.menu.item",
        function* registerMenu() {
          yield ctx.slots.register(
            {
              name: "sidebar.workspaces.session.menu.item",
              id: "handy-highlight",
              order: 500,
              inject: () => ({ store, actions, t }),
            },
            HighlightMenuItem,
          );
          yield ctx.slots.register(
            {
              name: "sidebar.workspaces.session.menu.item",
              id: "handy-group",
              order: 510,
              inject: () => ({ store, actions, t }),
            },
            GroupMenuItem,
          );
        },
      ),
    "dsh-handy: session menu entries",
  );

  // File-tab right-click menu: the four bulk-close actions are appended to
  // the sidebar's own tab menu, so they inherit its positioning and theme.
  ctx.effect(
    () =>
      ctx.slots.inject(
        "sidebar.right.tab.menu.item",
        function* registerTabMenu() {
          const modes = [
            ["handy-close-current", "current", 1001],
            ["handy-close-left", "left", 1002],
            ["handy-close-right", "right", 1003],
            ["handy-close-all", "all", 1004],
          ];
          for (const [id, mode, order] of modes) {
            yield ctx.slots.register(
              {
                name: "sidebar.right.tab.menu.item",
                id,
                order,
                inject: () => ({ store, t }),
              },
              (props) => h(FileTabMenuAction, { ...props, mode, store, t }),
            );
          }
        },
      ),
    "dsh-handy: file tab menu entries",
  );

  // A single global toast for fork/group/highlight feedback.
  ctx.effect(
    () =>
      ctx.slots.inject("shell.overlay", () =>
        ctx.slots.register(
          {
            name: "shell.overlay",
            id: "handy-toast",
            inject: () => ({ store, actions, t }),
          },
          HandyToast,
        ),
      ),
    "dsh-handy: toast overlay",
  );

  // The adapter reads the live controller lazily; publish it for the tab
  // menu rows, which do not receive the service through their slot face.
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

  // Client-side slash command: `/fork` is a popup over user turns.
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
            return (
              ctx.get("sessions")?.subagentAddress?.(sessionId) === undefined
            );
          },
          ui: {
            kind: "popupSelect",
            searchMode: "fuzzy-label",
            searchLabels: () => ({
              placeholder: t("fork.search"),
              empty: t("fork.empty"),
              noResults: t("fork.noResults"),
            }),
            options: async (context, signal) => {
              signal?.throwIfAborted?.();
              const sessionId =
                context?.sessionId ?? context?.session?.sessionId;
              if (typeof sessionId !== "string") return [];
              const entries =
                context?.eventSource?.getSnapshot?.().entries ??
                readEntries(ctx, sessionId);
              const turns = forkableTurns(entries).slice().reverse();
              return turns.map((row) => ({
                id: `turn:${row.turn}`,
                label: `${fmt(t, "fork.option", { n: row.turn })} · ${excerpt(row.prompt || row.reply, 64) || t("tree.turnPromptEmpty")}`,
                detail: fmt(
                  t,
                  row.completed ? "fork.optionDetail" : "fork.optionRunning",
                  {
                    time: formatTime(row.time, locale),
                  },
                ),
                seq: row.endSeq ?? row.lastSeq ?? row.startSeq,
                turn: row.turn,
                group: { name: "turns", label: t("fork.group") },
              }));
            },
            onSelect: async (option, context) => {
              const sessionId =
                context?.sessionId ?? context?.session?.sessionId;
              if (typeof sessionId !== "string") return;
              try {
                const childId = await ctx.get("sessions").fork({
                  sessionId,
                  atSeq: option.seq,
                  increaseTitle: true,
                });
                actions.recordFork(childId, sessionId, option.seq, option.turn);
                actions.say("toast.forkCreated", { n: option.turn });
                actions.openSession(childId);
              } catch (error) {
                actions.say(
                  "toast.forkFailed",
                  {
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  "error",
                );
              }
            },
          },
        });
      } catch (error) {
        console.warn("dsh-handy: /fork registration failed", error);
        return () => {};
      }
    }, "dsh-handy: /fork command");
  });
}

export { apply };
