/** Plugin CSS, injected once per document. */
const CSS = `
:root {
  --hy-brand: var(--dsw-alias-brand-primary, #4f6ef7);
  --hy-bg: var(--dsw-alias-bg-layer-1, #ffffff);
  --hy-bg-soft: var(--dsw-alias-bg-layer-2, #f7f8fa);
  --hy-border: var(--dsw-alias-border-l2, #e5e7eb);
  --hy-border-soft: var(--dsw-alias-border-l1, #eef0f3);
  --hy-text: var(--dsw-alias-label-primary, #1f2328);
  --hy-text-2: var(--dsw-alias-label-secondary, #5c6370);
  --hy-text-3: var(--dsw-alias-label-tertiary, #8b93a1);
  --hy-hover: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.045));
  --hy-danger: var(--dsw-alias-state-error-primary, #dc2626);
  --hy-warn: var(--dsw-alias-state-warn-primary, #b45309);
  --hy-radius: var(--dsw-radius-lg, 10px);
  --hy-radius-sm: var(--dsw-radius-sm, 6px);
}
.hy-root, .hy-dashboard, .hy-toast, .hy-tab-menu-item {
  font-family: var(--dsw-font-family, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
}
.hy-dashboard {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: var(--hy-text);
  background: var(--dsw-specific-conversation-fill, var(--hy-bg));
}
.hy-head {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 26px 12px;
}
.hy-head-mark {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--hy-brand), color-mix(in srgb, var(--hy-brand) 55%, #8b5cf6));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--hy-brand) 22%, transparent);
  font-size: 17px;
}
.hy-head-copy { min-width: 0; flex: 1; }
.hy-title { margin: 0; font-size: 18px; line-height: 24px; font-weight: 650; letter-spacing: .01em; }
.hy-subtitle { margin-top: 3px; color: var(--hy-text-3); font-size: 12px; line-height: 18px; }
.hy-tabs {
  flex: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 22px;
  border-bottom: 1px solid var(--hy-border-soft);
}
.hy-tab {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text-3);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  padding: 9px 11px 10px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
}
.hy-tab:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-tab[data-active="true"] { color: var(--hy-text); font-weight: 600; }
.hy-tab[data-active="true"]::after {
  content: "";
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--hy-brand);
}
.hy-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  margin-left: 5px;
  border-radius: 999px;
  background: var(--hy-hover);
  color: var(--hy-text-3);
  font-size: 10px;
  font-weight: 600;
}
.hy-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 22px 32px;
  scrollbar-gutter: stable;
}
.hy-body-inner { max-width: 900px; margin: 0 auto; }
.hy-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.hy-segment {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--hy-border-soft);
  border-radius: 999px;
  background: var(--hy-bg-soft);
}
.hy-segment button {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text-3);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.hy-segment button[data-active="true"] {
  color: var(--hy-text);
  background: var(--hy-bg);
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.hy-input {
  box-sizing: border-box;
  min-width: 0;
  height: 32px;
  flex: 1;
  border: 1px solid var(--hy-border);
  border-radius: 8px;
  background: var(--hy-bg);
  color: var(--hy-text);
  font: inherit;
  font-size: 13px;
  padding: 0 10px;
  outline: none;
}
.hy-input:focus { border-color: var(--hy-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hy-brand) 15%, transparent); }
.hy-btn {
  appearance: none;
  border: 1px solid var(--hy-border);
  background: var(--hy-bg);
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.hy-btn:hover { background: var(--hy-hover); }
.hy-btn-primary {
  border-color: transparent;
  background: var(--hy-brand);
  color: #fff;
}
.hy-btn-primary:hover { filter: brightness(.95); background: var(--hy-brand); }
.hy-btn-ghost { border-color: transparent; background: transparent; color: var(--hy-text-2); }
.hy-btn-ghost:hover { background: var(--hy-hover); color: var(--hy-text); }
.hy-btn-danger { color: var(--hy-danger); }
.hy-btn-danger-text { background: transparent; color: var(--hy-danger); border-color: transparent; }
.hy-btn-danger-text:hover { background: color-mix(in srgb, var(--hy-danger) 12%, transparent); }
.hy-btn-sm { height: 26px; padding: 0 8px; font-size: 11px; border-radius: 6px; }
.hy-icon-btn {
  appearance: none;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 14px;
  line-height: 1;
}
.hy-icon-btn:hover { background: var(--hy-hover); color: var(--hy-text); }
.hy-empty {
  border: 1px dashed var(--hy-border);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  color: var(--hy-text-3);
  font-size: 13px;
  line-height: 20px;
  background: color-mix(in srgb, var(--hy-bg-soft) 55%, transparent);
}
.hy-hint { color: var(--hy-text-3); font-size: 11px; line-height: 17px; }
.hy-group {
  border: 1px solid var(--hy-border-soft);
  border-radius: 12px;
  background: var(--hy-bg);
  margin-bottom: 10px;
  overflow: hidden;
}
.hy-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  cursor: pointer;
  user-select: none;
}
.hy-group-head:hover { background: var(--hy-hover); }
.hy-group-name { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hy-group-count { color: var(--hy-text-3); font-size: 11px; }
.hy-group-body { border-top: 1px solid var(--hy-border-soft); padding: 6px; }
.hy-session-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.hy-session-row:hover { background: var(--hy-hover); }
.hy-session-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hy-border); flex: none; }
.hy-session-row[data-highlight="true"] .hy-session-dot { background: var(--hy-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hy-brand) 14%, transparent); }
.hy-session-copy { min-width: 0; flex: 1; }
.hy-session-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--hy-text); }
.hy-session-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: var(--hy-text-3); margin-top: 1px; }
.hy-session-actions { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity .12s; }
.hy-session-row:hover .hy-session-actions, .hy-session-row:focus-within .hy-session-actions { opacity: 1; }
.hy-star { color: var(--hy-warn); }
.hy-star[data-on="false"] { color: var(--hy-text-3); }
.hy-pending {
  border: 1px solid color-mix(in srgb, var(--hy-brand) 30%, var(--hy-border));
  background: color-mix(in srgb, var(--hy-brand) 5%, var(--hy-bg));
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.hy-pending-title { font-size: 12px; line-height: 18px; color: var(--hy-text-2); margin-bottom: 8px; }
.hy-pending-list { display: flex; flex-wrap: wrap; gap: 6px; }
.hy-wtree-view {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 22px 28px 40px;
  background: var(--dsw-alias-bg-base);
  color: var(--hy-text);
}
.hy-wtree-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--hy-border);
}
.hy-wtree-title { margin: 0; font-size: 17px; line-height: 24px; font-weight: 650; }
.hy-wtree-workspace { color: var(--hy-text-2); font-size: 12px; }
.hy-wtree-total { margin-left: auto; color: var(--hy-text-3); font-size: 11px; }
.hy-wtree { max-width: 900px; display: flex; flex-direction: column; gap: 5px; }
.hy-wtree-node { min-width: 0; }
.hy-wtree-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  padding: 7px 12px;
  border: 1px solid var(--hy-border);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  cursor: pointer;
  user-select: none;
  transition: border-color .12s, background .12s;
}
.hy-wtree-card:hover { background: var(--hy-hover); border-color: var(--dsw-alias-border-l4); }
.hy-wtree-card[data-current="true"] {
  border-color: color-mix(in srgb, var(--hy-brand) 55%, var(--hy-border));
  background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 10%, var(--dsw-alias-bg-layer-1)), var(--dsw-alias-bg-layer-1) 70%);
  box-shadow: inset 2px 0 0 var(--hy-brand);
}
.hy-wtree-card[data-highlight="true"] .hy-wtree-dot { background: var(--hy-warn); }
.hy-wtree-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--hy-border); }
.hy-wtree-card[data-current="true"] .hy-wtree-dot { background: var(--hy-brand); }
.hy-wtree-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.hy-wtree-line { min-width: 0; display: flex; align-items: center; gap: 7px; }
.hy-wtree-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 19px; font-weight: 560; }
.hy-wtree-card[data-current="true"] .hy-wtree-name { color: var(--hy-brand); }
.hy-wtree-badge {
  flex: none;
  padding: 1px 6px;
  border-radius: 99px;
  color: var(--hy-brand);
  background: color-mix(in srgb, var(--hy-brand) 12%, transparent);
  font-size: 10px;
  line-height: 16px;
}
.hy-wtree-star { flex: none; color: var(--hy-warn); font-size: 11px; }
.hy-wtree-meta { color: var(--hy-text-3); font-size: 10px; line-height: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hy-wtree-count { flex: none; color: var(--hy-text-3); font-size: 10px; }
.hy-wtree-children {
  margin: 5px 0 2px 19px;
  padding-left: 18px;
  border-left: 1px dashed color-mix(in srgb, var(--hy-border) 85%, transparent);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.hy-wtree-legend { max-width: 900px; margin-top: 18px; color: var(--hy-text-3); font-size: 11px; line-height: 17px; }
.hy-tree-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.hy-tree-head-title { font-size: 13px; font-weight: 600; }
.hy-branch {
  position: relative;
  margin-left: 0;
  padding-left: 0;
}
.hy-branch[data-depth]:not([data-depth="0"]) {
  margin-left: 18px;
  padding-left: 16px;
  border-left: 1px solid var(--hy-border);
}
.hy-branch-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 8px;
  border-radius: 8px;
  background: var(--hy-bg-soft);
  margin: 4px 0 6px;
}
.hy-branch-title {
  min-width: 0;
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hy-branch-meta { color: var(--hy-text-3); font-size: 10px; flex: none; }
.hy-node-wrap { position: relative; }
.hy-node {
  appearance: none;
  border: 0;
  background: none;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  color: var(--hy-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  position: relative;
}
.hy-node:hover { background: var(--hy-hover); }
.hy-node::before {
  content: "";
  position: absolute;
  left: 13px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--hy-border-soft);
}
.hy-node:last-child::before { bottom: 50%; }
.hy-node-dot {
  width: 9px;
  height: 9px;
  flex: none;
  border-radius: 50%;
  border: 2px solid var(--hy-border);
  background: var(--hy-bg);
  margin: 5px 0 0 1px;
  z-index: 1;
}
.hy-node[data-current="true"] .hy-node-dot { border-color: var(--hy-brand); background: var(--hy-brand); }
.hy-node-text { min-width: 0; flex: 1; }
.hy-node-title { font-size: 12px; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hy-node-sub { color: var(--hy-text-3); font-size: 10px; line-height: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hy-node[data-current="true"] .hy-node-title { color: var(--hy-brand); font-weight: 600; }
.hy-node-children { margin-left: 9px; }
.hy-row-action {
  appearance: none;
  border: 0;
  background: none;
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}
.hy-row-action:hover { color: var(--hy-warn); background: var(--hy-hover); }
.hy-row-action[data-on="true"] { color: var(--hy-warn); }
.hy-tab-menu-item {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 26px;
  text-align: left;
  width: 100%;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
}
.hy-tab-menu-item:hover { background: var(--hy-hover); }
.hy-tab-menu-item:disabled { color: var(--hy-text-3); cursor: default; background: none; }
.hy-menu-sep { height: 1px; background: var(--hy-border-soft); margin: 4px 6px; }
.hy-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 2147483000;
  max-width: min(460px, calc(100vw - 32px));
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--hy-text);
  color: var(--hy-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,.22);
  font-size: 12px;
  line-height: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: hy-toast-in .16s ease-out;
  pointer-events: none;
}
.hy-toast[data-kind="error"] { background: var(--hy-danger); color: #fff; }
@keyframes hy-toast-in { from { opacity: 0; transform: translate(-50%, 6px); } to { opacity: 1; transform: translate(-50%, 0); } }
.hy-groups {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 2px 0 4px;
  min-width: 0;
}
.hy-group-row {
  box-sizing: border-box;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
  border-radius: var(--dsw-radius-md);
  color: var(--hy-text);
  cursor: pointer;
  user-select: none;
}
.hy-group-row:hover { background: var(--hy-hover); }
.hy-group-row[data-handy-drop="true"] {
  background: color-mix(in srgb, var(--hy-brand) 16%, transparent);
  outline: 1px dashed var(--hy-brand);
  outline-offset: -1px;
}
.hy-group-row[data-handy-drop="invalid"] {
  background: color-mix(in srgb, var(--hy-danger) 12%, transparent);
  outline: 1px dashed var(--hy-danger);
  outline-offset: -1px;
}
[data-handy-draggable="true"] { cursor: grab; }
[data-handy-dragging="true"] { opacity: .55; }
.hy-group-chevron { width: 14px; flex: none; color: var(--hy-text-3); font-size: 10px; text-align: center; }
.hy-group-folder { width: 16px; height: 16px; flex: none; color: var(--hy-text-3); display: inline-flex; align-items: center; justify-content: center; }
.hy-group-row[data-current="true"] .hy-group-folder { color: var(--hy-brand); }
.hy-group-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
}
.hy-group-count {
  flex: none;
  color: var(--hy-text-3);
  font-size: 10px;
  line-height: 16px;
}
.hy-group-menu, .hy-gsession-menu {
  appearance: none;
  border: 0;
  background: none;
  width: 18px;
  height: 18px;
  flex: none;
  padding: 0;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 13px;
  line-height: 1;
  opacity: .45;
}
.hy-group-row:hover .hy-group-menu, .hy-group-row:focus-within .hy-group-menu,
.hy-gsession:hover .hy-gsession-menu, .hy-gsession:focus-within .hy-gsession-menu { opacity: 1; }
.hy-group-menu:hover, .hy-gsession-menu:hover { color: var(--hy-text); background: var(--hy-hover); }
.hy-gsession {
  box-sizing: border-box;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
  border-radius: var(--dsw-radius-md);
  color: var(--hy-text);
  cursor: pointer;
  user-select: none;
}
.hy-gsession:hover { background: var(--hy-hover); }
.hy-gsession[data-current="true"] { background: var(--dsw-alias-interactive-bg-hover); }
.hy-gsession[data-highlight="true"] { background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 14%, transparent), transparent 75%); box-shadow: inset 2px 0 0 var(--hy-brand); }
.hy-gsession-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--hy-border); }
.hy-gsession[data-highlight="true"] .hy-gsession-dot { background: var(--hy-brand); }
.hy-gsession-title { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 20px; }
.hy-gsession-time { flex: none; color: var(--hy-text-3); font-size: 10px; line-height: 16px; }
.hy-gsession-star {
  appearance: none;
  border: 0;
  background: none;
  width: 18px;
  height: 18px;
  flex: none;
  padding: 0;
  border-radius: 4px;
  color: var(--hy-text-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  font-size: 12px;
  line-height: 1;
  opacity: 0;
}
.hy-gsession:hover .hy-gsession-star, .hy-gsession:focus-within .hy-gsession-star { opacity: 1; }
.hy-gsession-star[data-on="true"] { color: var(--hy-warn); opacity: 1; }
.hy-menu {
  position: fixed;
  z-index: 2147483000;
  min-width: 190px;
  max-width: 300px;
  padding: 5px;
  border: 1px solid var(--hy-border);
  border-radius: 10px;
  background: var(--hy-bg);
  box-shadow: 0 12px 34px rgba(0,0,0,.18);
  color: var(--hy-text);
}
.hy-menu-item {
  appearance: none;
  border: 0;
  background: none;
  width: 100%;
  height: 30px;
  padding: 0 9px;
  border-radius: 7px;
  color: var(--hy-text);
  font: inherit;
  font-size: 12px;
  line-height: 30px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}
.hy-menu-item:hover { background: var(--hy-hover); }
.hy-menu-item[data-danger="true"] { color: var(--hy-danger); }
.hy-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.25);
}
.hy-modal {
  width: min(400px, 100%);
  box-sizing: border-box;
  border: 1px solid var(--hy-border);
  border-radius: 14px;
  background: var(--hy-bg);
  box-shadow: 0 20px 60px rgba(0,0,0,.22);
  padding: 18px;
  color: var(--hy-text);
}
.hy-modal-title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 650; }
.hy-modal-desc { margin-top: 5px; color: var(--hy-text-3); font-size: 12px; line-height: 18px; }
.hy-modal-list { margin: 12px 0 0; max-height: 280px; overflow: auto; display: flex; flex-direction: column; gap: 3px; }
.hy-modal-option {
  appearance: none;
  border: 0;
  background: none;
  color: var(--hy-text);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hy-modal-option:hover { background: var(--hy-hover); }
.hy-modal-option-detail { margin-left: auto; color: var(--hy-text-3); font-size: 10px; }
.hy-modal-actions { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; }
.hy-modal-error { margin-top: 7px; color: var(--hy-danger); font-size: 11px; line-height: 16px; min-height: 16px; }
.hy-modal .hy-input { width: 100%; margin-top: 12px; }
[data-handy-highlight="true"] {
  background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 15%, transparent), transparent 72%) !important;
  box-shadow: inset 2px 0 0 var(--hy-brand);
}
[data-handy-highlight="true"]:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--hy-brand) 21%, transparent), var(--hy-hover) 85%) !important;
}
[data-handy-highlight="true"] .hy-star, [data-handy-highlight="true"] .hy-row-action[data-on="true"] { color: var(--hy-warn); }
body[data-ds-dark-theme] .hy-dashboard { background: var(--dsw-specific-conversation-fill, #17181b); }
@media (max-width: 640px) {
  .hy-head { padding: 16px 16px 10px; }
  .hy-tabs { padding: 0 12px; }
  .hy-body { padding: 14px 12px 24px; }
  .hy-subtitle { display: none; }
}
`;

function injectStyle() {
  if (typeof document === "undefined") return;
  const key = "dsh-handy/global.css";
  if (
    document.querySelector(`style[data-plugin-css=${JSON.stringify(key)}]`) !==
    null
  )
    return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-handy";
  tag.dataset.pluginCss = key;
  tag.textContent = CSS;
  (document.head ?? document.documentElement).appendChild(tag);
}

export { CSS, injectStyle };
