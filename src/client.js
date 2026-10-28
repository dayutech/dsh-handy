/**
 * Browser bundle entry.
 *
 * The build script wraps this CommonJS bundle in DSH's Module Loader factory,
 * so the runtime `require` is supplied by the host.
 */
export { apply } from "./plugin.js";
export const name = "dsh-handy";
export const inject = ["slots", "locale"];
