/** Global toast for fork/group/highlight feedback. */
import { h, useEffect } from "./runtime.js";
import { useHandy } from "./state.js";
function HandyToast({ store, actions, t }) {
  const state = useHandy();
  const toast = state.toast;
  useEffect(() => {
    if (toast === null) return undefined;
    const timer = globalThis.setTimeout(() => actions.dismissToast(), 2800);
    return () => globalThis.clearTimeout(timer);
  }, [toast?.id, actions]);
  if (toast === null) return null;
  return h(
    "div",
    {
      className: "hy-toast",
      "data-kind": toast.kind === "error" ? "error" : "info",
      role: "status",
    },
    h("span", { "aria-hidden": "true" }, toast.kind === "error" ? "!" : "✓"),
    h("span", null, toast.message),
  );
}

export { HandyToast };
