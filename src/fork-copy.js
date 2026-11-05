/** Carry notebook and key information into every fork child. */
const WRAPPED = Symbol("dsh-handy.fork-copy");

export function installForkCopy(ctx, actions) {
  return ctx.inject(["sessions"], (serviceCtx) =>
    serviceCtx.effect(() => {
      const sessions = serviceCtx.get("sessions");
      const original = sessions?.fork;
      if (typeof original !== "function") return () => {};
      if (original[WRAPPED] === true) return () => {};

      const wrapped = async function forkWithHandyData(opts) {
        const sourceId =
          typeof opts?.sessionId === "string" ? opts.sessionId : undefined;
        const copy = (childId) => {
          if (
            typeof childId === "string" &&
            childId !== "" &&
            sourceId !== undefined
          ) {
            actions.copySessionHandyData(sourceId, childId);
          }
        };
        const originalOnCreated = opts?.onCreated;
        const next =
          typeof originalOnCreated === "function"
            ? {
                ...opts,
                onCreated: (childId) => {
                  copy(childId);
                  originalOnCreated(childId);
                },
              }
            : opts;
        const childId = await original.call(this, next);
        copy(childId);
        return childId;
      };
      wrapped[WRAPPED] = true;

      try {
        sessions.fork = wrapped;
      } catch (error) {
        console.warn("dsh-handy: cannot wrap session fork", error);
        return () => {};
      }

      return () => {
        if (sessions.fork === wrapped) sessions.fork = original;
      };
    }, "dsh-handy: fork data copy"),
  );
}
