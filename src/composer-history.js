/**
 * Shell-like prompt history for the composer.
 *
 * Up recalls the previous user message of the current session, Down walks
 * forward again and finally restores the draft that was there before history
 * navigation started. History comes from the durable Session event log, so it
 * survives reloads and matches what the transcript shows.
 */
import { currentSessionId, eventOf, readEntries, textOfContent } from "./session.js";

const COMPOSER = "[data-composer-input]";
const MAX_HISTORY = 100;
const LINE_TOLERANCE = 0.75;

/**
 * Previously sent user messages of one Session, oldest first.
 *
 * Only real user prompts count: tool/synthetic sources and empty text are
 * skipped, and consecutive duplicates collapse (repeated "继续" is one step,
 * not ten). The most recent turns win when the log is longer than the cap.
 * @param entries - loaded Session event window.
 * @returns recalled prompt texts, oldest first.
 */
function promptHistory(entries) {
  const texts = [];
  for (const entry of entries ?? []) {
    const event = eventOf(entry);
    if (event === null || typeof event !== "object") continue;
    if (event.type !== "user/message") continue;
    const source = event.data?.source;
    if (source !== undefined && source !== null && source.kind !== "user")
      continue;
    const text = textOfContent(event.data?.content);
    if (text === "") continue;
    if (texts[texts.length - 1] === text) continue;
    texts.push(text);
  }
  return texts.slice(-MAX_HISTORY);
}

/**
 * Resolve the Session input facade that owns the visible composer.
 *
 * `conversation.input.shell(id)` is the shipped service-face path for
 * id-addressed access; the composer's own actions face is the same object, so
 * `setDraft` here writes exactly what the user sees.
 * @param ctx - plugin client context.
 * @param sessionId - Session whose composer is focused.
 * @returns the per-session input shell, or undefined when unavailable.
 */
function sessionInput(ctx, sessionId) {
  const conversation = ctx.get("conversation");
  const input = conversation?.input;
  if (typeof input?.shell !== "function") return undefined;
  try {
    return input.shell(sessionId);
  } catch (error) {
    console.warn("dsh-handy: history input unavailable", error);
    return undefined;
  }
}

/**
 * Whether the collapsed caret sits on the first or last visual line.
 *
 * History only takes over an arrow when the caret cannot move any further in
 * that direction, so editing a multi-line recalled prompt keeps normal caret
 * movement. An unmeasurable selection answers false: native behaviour wins.
 * @param root - composer contenteditable element.
 * @param edge - "start" (first line) or "end" (last line).
 * @returns whether the caret is on that edge line.
 */
function caretAtEdge(root, edge) {
  if (typeof window === "undefined" || typeof window.getSelection !== "function")
    return false;
  const selection = window.getSelection();
  if (selection === null || selection.rangeCount === 0) return false;
  if (!selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return false;
  const caret = range.getBoundingClientRect();
  const box = root.getBoundingClientRect();
  if (box.height === 0 || (caret.width === 0 && caret.height === 0)) return false;
  const style = window.getComputedStyle(root);
  const lineHeight = parseFloat(style.lineHeight);
  const fontSize = parseFloat(style.fontSize);
  const line =
    lineHeight > 0 ? lineHeight : (fontSize > 0 ? fontSize : 14) * 1.5;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  if (edge === "start")
    return caret.top - (box.top + paddingTop) < line * LINE_TOLERANCE;
  return box.bottom - paddingBottom - caret.bottom < line * LINE_TOLERANCE;
}

/**
 * Install composer history navigation.
 * @param ctx - plugin client context.
 * @returns the effect disposer.
 */
function installComposerHistory(ctx) {
  return ctx.effect(() => {
    if (typeof document === "undefined") return () => {};

    const state = {
      sessionId: undefined,
      items: [],
      index: -1,
      savedDraft: "",
      applied: undefined,
      navigating: false,
    };

    const clear = () => {
      state.items = [];
      state.index = -1;
      state.savedDraft = "";
      state.applied = undefined;
      state.navigating = false;
    };

    const composerOf = (target) => {
      if (typeof Element === "undefined" || !(target instanceof Element))
        return null;
      return target.closest(COMPOSER);
    };

    const applyDraft = (input, text) => {
      try {
        input.actions?.setDraft?.(text);
        state.applied = text;
      } catch (error) {
        console.warn("dsh-handy: history draft write failed", error);
        clear();
      }
    };

    const onKeyDown = (event) => {
      if (event.defaultPrevented) return;
      if (event.isComposing || event.keyCode === 229) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
        return;
      const root = composerOf(event.target);
      if (root === null) return;
      if (root.getAttribute("aria-disabled") === "true") return;

      const sessionId = currentSessionId(
        ctx.get("sessions")?.list?.getSnapshot?.(),
      );
      if (typeof sessionId !== "string" || sessionId === "") {
        clear();
        return;
      }
      if (sessionId !== state.sessionId) {
        clear();
        state.sessionId = sessionId;
      }

      if (
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown" &&
        event.key !== "Escape"
      )
        return;

      const input = sessionInput(ctx, sessionId);
      if (input === undefined) return;
      if (typeof input.actions?.setDraft !== "function") return;
      const snapshot = input.snapshot ?? {};
      const draft = typeof snapshot.draft === "string" ? snapshot.draft : "";
      if (
        state.navigating &&
        state.applied !== undefined &&
        draft !== state.applied &&
        draft !== `${state.applied}\n`
      ) {
        // Something other than this history wrote the draft (send, quote
        // insertion, external edit): the recalled position no longer holds.
        clear();
      }
      if (snapshot.phase !== undefined && snapshot.phase !== "plain") return;
      const attachments = Array.isArray(snapshot.attachmentIds)
        ? snapshot.attachmentIds.length
        : 0;
      const occurrences = Array.isArray(snapshot.occurrences)
        ? snapshot.occurrences.length
        : 0;
      // Quotes are not part of the published input state; replacing the draft
      // would drop them, so they block history capture like attachments do.
      let quotes = 0;
      try {
        const projection = input.projection ?? {};
        if (Array.isArray(projection.quotes)) quotes = projection.quotes.length;
      } catch {
        quotes = 0;
      }

      if (event.key === "ArrowUp") {
        if (!state.navigating) {
          if (
            draft.trim() !== "" ||
            attachments > 0 ||
            occurrences > 0 ||
            quotes > 0
          )
            return;
          let items;
          try {
            items = promptHistory(readEntries(ctx, sessionId));
          } catch (error) {
            console.warn("dsh-handy: history read failed", error);
            return;
          }
          if (items.length === 0) return;
          event.preventDefault();
          event.stopPropagation();
          state.items = items;
          state.savedDraft = draft;
          state.index = items.length - 1;
          state.navigating = true;
          applyDraft(input, items[state.index]);
          return;
        }
        if (!caretAtEdge(root, "start")) return;
        event.preventDefault();
        event.stopPropagation();
        if (state.index > 0) {
          state.index -= 1;
          applyDraft(input, state.items[state.index]);
        }
        return;
      }

      if (event.key === "ArrowDown" && state.navigating) {
        if (!caretAtEdge(root, "end")) return;
        event.preventDefault();
        event.stopPropagation();
        if (state.index < state.items.length - 1) {
          state.index += 1;
          applyDraft(input, state.items[state.index]);
          return;
        }
        const restore = state.savedDraft;
        clear();
        applyDraft(input, restore);
        return;
      }

      if (event.key === "Escape" && state.navigating) {
        event.preventDefault();
        event.stopPropagation();
        const restore = state.savedDraft;
        clear();
        applyDraft(input, restore);
      }
    };

    const onUserEdit = (event) => {
      if (!state.navigating) return;
      if (composerOf(event.target) === null) return;
      // Typing (or an IME burst) takes the draft over; keep the edit and leave
      // history navigation, so the next Up starts again from the newest prompt.
      clear();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("beforeinput", onUserEdit, true);
    document.addEventListener("compositionstart", onUserEdit, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("beforeinput", onUserEdit, true);
      document.removeEventListener("compositionstart", onUserEdit, true);
    };
  }, "dsh-handy: composer history");
}

export { installComposerHistory, promptHistory };
