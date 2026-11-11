/** Browser plugin wiring: slots, commands, observers, and handlers. */
import { h, NS, setHandyT } from "./runtime.js";
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
import { TabMenuAction } from "./file-tabs.js";
import { HandyToast } from "./toast.js";
import { NotebookView } from "./notebook.js";
import { KeyInfoPanel } from "./key-info.js";
import { installGroupSidebar, installWorkspaceMenu } from "./groups.js";
import { installWorkspaceSort } from "./workspace-sort.js";
import { installForkCopy } from "./fork-copy.js";
import { installComposerHistory } from "./composer-history.js";
import { forkableTurns, readEntries, formatTime, excerpt } from "./session.js";
function apply(ctx) {
  injectStyle();
  const t = ctx.locale.bind(NS);
  const locale =
    (ctx.locale.getLocale?.().active ?? "zh") === "en" ? "en" : "zh";
  setHandyT(t);
  const actions = makeActions(ctx, t, locale);

  ctx.effect(
    () => ctx.locale.register(NS, { zh: zhMessages, en: enMessages }),
    "dsh-handy: dictionaries",
  );
  installHighlightObserver(ctx);
  installStorageSync(ctx);
  installGroupSidebar(ctx, actions, t, locale);
  installWorkspaceMenu(ctx, actions, t);
  installWorkspaceSort(ctx);
  installForkCopy(ctx, actions);
  installComposerHistory(ctx);
  ctx.effect(
    () => () => {
      closeActiveMenu();
      for (const node of document.querySelectorAll("[data-handy-modal]"))
        node.remove();
    },
    "dsh-handy: transient overlay cleanup",
  );

  // The notebook sits beside "对话" and "轨迹" as a per-session view tab.
  ctx.effect(
    () =>
      ctx.slots.inject("conversation.view", () =>
        ctx.slots.register(
          {
            name: "conversation.view",
            id: "handy-notebook",
            order: 30,
            label: () => t("notebook.tab"),
            locale: NS,
            inject: (sessionId) => ({
              handyActions: actions,
              handySessionId: sessionId,
            }),
          },
          NotebookView,
        ),
      ),
    "dsh-handy: conversation notebook view",
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

  // Right-sidebar tab menu: the four bulk-close actions work for every tab
  // kind, including tabs added by other plugins later.
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
              (props) => h(TabMenuAction, { ...props, mode, store, t }),
            );
          }
        },
      ),
    "dsh-handy: file tab menu entries",
  );

  // The floating key-information panel is mounted by the session header so it
  // exists only while a session page is visible, never on the welcome screen.
  ctx.effect(
    () =>
      ctx.slots.inject("conversation.session.header.utilities", () =>
        ctx.slots.register(
          {
            name: "conversation.session.header.utilities",
            id: "handy-key-info",
            order: 60,
            inject: (sessionId) => ({ sessionId, handyActions: actions, t }),
          },
          KeyInfoPanel,
        ),
      ),
    "dsh-handy: key information panel",
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
                label: `${fmt(t, "fork.option", { n: row.turn })} · ${excerpt(row.prompt || row.reply, 64) || t("fork.turnEmpty")}`,
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
                actions.copySessionHandyData(sessionId, childId);
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
