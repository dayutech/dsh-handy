/** Transient menus, dialogs, and HTML5 drag helpers. */
import { handyT } from "./runtime.js";
let draggedSession = null;

function startSessionDrag(event, sessionId, workspaceId) {
  if (typeof sessionId !== "string" || typeof workspaceId !== "string") {
    event.preventDefault();
    return;
  }
  draggedSession = { sessionId, workspaceId };
  const transfer = event.dataTransfer;
  if (transfer !== null && transfer !== undefined) {
    try {
      transfer.effectAllowed = "move";
      transfer.setData("application/x-dsh-handy-session", sessionId);
      transfer.setData("text/plain", sessionId);
    } catch {
      // Some browsers restrict custom drag payloads; the module value still works.
    }
  }
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setAttribute("data-handy-dragging", "true");
  }
}

function endSessionDrag() {
  draggedSession = null;
  if (typeof document === "undefined") return;
  for (const node of document.querySelectorAll(
    "[data-handy-dragging], [data-handy-drop]",
  )) {
    node.removeAttribute("data-handy-dragging");
    node.removeAttribute("data-handy-drop");
  }
}

let activeMenu = null;

function closeActiveMenu() {
  if (activeMenu === null) return;
  const current = activeMenu;
  activeMenu = null;
  current.cleanup();
  current.element.remove();
}

function showMenu(anchor, items) {
  if (
    typeof document === "undefined" ||
    anchor === null ||
    anchor === undefined
  )
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
    Math.min(window.innerWidth - width - 8, rect.right - width),
  );
  const top =
    rect.bottom + 6 + height > window.innerHeight - 8
      ? Math.max(8, rect.top - height - 6)
      : rect.bottom + 6;
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
    },
  };
}

function openModal({
  title,
  description,
  body,
  confirmLabel,
  onConfirm,
  danger = false,
  validate,
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
  if (description !== undefined && description !== "") {
    const copy = document.createElement("div");
    copy.className = "hy-modal-desc";
    copy.textContent = description;
    panel.appendChild(copy);
  }
  if (body !== undefined) panel.appendChild(body);
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
  confirm.className = danger
    ? "hy-btn hy-btn-danger-text"
    : "hy-btn hy-btn-primary";
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
    if (problem !== undefined && problem !== "") {
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
    if (
      event.key === "Enter" &&
      event.target instanceof HTMLElement &&
      event.target.tagName === "INPUT"
    ) {
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
  onConfirm,
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
    validate: () =>
      input.value.trim() === "" ? handyT("groups.emptyName") : undefined,
    onConfirm: () => onConfirm(input.value.trim()),
  });
  return modal;
}

function showConfirmDialog({
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
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
    if (option.detail !== undefined) {
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
  if (extra !== undefined) {
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
    onConfirm: () => {},
  });
  // A choice dialog treats cancel as the only footer action.
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

export {
  startSessionDrag,
  endSessionDrag,
  closeActiveMenu,
  showMenu,
  openModal,
  showTextDialog,
  showConfirmDialog,
  showChoiceDialog,
};
