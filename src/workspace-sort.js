/** Keep running workspaces at the top and mark running session rows. */
export function installWorkspaceSort(ctx) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {};
    let scheduled = false;

    const readSnapshots = () => {
      const sessions = ctx.get("sessions");
      const workspaces = ctx.get("workspaces");
      const statuses =
        ctx.get("uiSession")?.sessionStatus?.getSnapshot?.() ?? new Map();
      return {
        list: sessions?.list?.getSnapshot?.(),
        workspaces: workspaces?.list?.getSnapshot?.(),
        statuses,
      };
    };

    const runningSubagentCount = (sessionId, list, statuses) => {
      const children =
        list?.projectionsBySession?.[sessionId]?.values?.subagentCatalog;
      if (!Array.isArray(children)) return 0;
      return children.reduce(
        (count, child) =>
          count +
          (statuses.get(child.id)?.running === true ||
          list?.byId?.[child.id]?.running === true
            ? 1
            : 0),
        0,
      );
    };

    const isRunning = (sessionId, list, statuses) =>
      statuses.get(sessionId)?.running === true ||
      list?.byId?.[sessionId]?.running === true ||
      runningSubagentCount(sessionId, list, statuses) > 0;

    const sync = () => {
      const { list, workspaces, statuses } = readSnapshots();
      const workspaceItems = workspaces?.items ?? [];

      for (const row of document.querySelectorAll(
        '[data-row-key^="session:"]',
      )) {
        const sessionId = row
          .getAttribute("data-row-key")
          ?.slice("session:".length);
        if (typeof sessionId !== "string" || sessionId === "") continue;
        if (isRunning(sessionId, list, statuses)) {
          row.setAttribute("data-handy-running", "true");
        } else {
          row.removeAttribute("data-handy-running");
        }
      }

      const workspaceOrder = new Map(
        workspaceItems.map((item, position) => [item.workspaceId, position]),
      );
      const groups = new Map();
      let fallbackIndex = 0;
      for (const row of document.querySelectorAll(
        '[data-row-key^="workspace:"]',
      )) {
        const workspaceId = row
          .getAttribute("data-row-key")
          ?.slice("workspace:".length);
        const section = row.parentElement?.parentElement;
        if (
          typeof workspaceId !== "string" ||
          workspaceId === "" ||
          section === null ||
          section === undefined
        ) {
          fallbackIndex += 1;
          continue;
        }
        const parent = section.parentElement;
        if (parent === null) {
          fallbackIndex += 1;
          continue;
        }
        const workspace = workspaceItems.find(
          (item) => item.workspaceId === workspaceId,
        );
        const running =
          workspace?.sessionIds.some((id) => isRunning(id, list, statuses)) ===
          true;
        const group = groups.get(parent) ?? [];
        group.push({
          section,
          running,
          index: workspaceOrder.get(workspaceId) ?? fallbackIndex,
        });
        groups.set(parent, group);
        fallbackIndex += 1;
      }

      for (const entries of groups.values()) {
        const sorted = entries
          .slice()
          .sort(
            (left, right) =>
              Number(right.running) - Number(left.running) ||
              left.index - right.index,
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
      statusSource?.subscribe?.(schedule),
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
