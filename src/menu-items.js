/** Native sidebar session-menu additions. */
import { h } from "./runtime.js";
import { MenuRow, useMenuItemClose } from "./shared-ui.js";
function GroupMenuItem({ sessionId, useMenuOpenState, store, actions, t }) {
  const close = useMenuItemClose(useMenuOpenState);
  return h(
    MenuRow,
    {
      onSelect: () => {
        close();
        actions.pickGroupForSession(sessionId);
      },
    },
    t("menu.addGroup"),
  );
}

export { GroupMenuItem };
