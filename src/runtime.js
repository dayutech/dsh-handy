/**
 * Shared browser runtime primitives.
 *
 * Everything here is host-provided: React, the optional DSH UI primitives, and
 * the module-scoped UI state that feature modules need to share without
 * importing the plugin entry point.
 */
import React from "react";
import * as ReactDOMNamespace from "react-dom";
import { createRoot as createRootClient } from "react-dom/client";
import * as primitivesNamespace from "@deepseek-ai/dsh-client-ui-primitives";

export const NS = "handy";
export const STORAGE_KEY = "dsh.handy.v1";

export const h = React.createElement;
export const {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} = React;

export const primitives = primitivesNamespace;
export const ReactDOM = ReactDOMNamespace;
export const ReactDOMClient = { createRoot: createRootClient };

export let handyT = (key) => key;
export function setHandyT(translate) {
  handyT = translate;
}

export let activeCtx = null;
export function setActiveCtx(ctx) {
  activeCtx = ctx;
}
export function getActiveCtx() {
  return activeCtx;
}
