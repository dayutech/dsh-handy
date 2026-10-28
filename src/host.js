/**
 * dsh-handy host half.
 *
 * The browser half owns all user-facing behaviour. This half only gives the
 * profile a mount point so the bundle can carry a client manifest and a stable
 * plugin identity.
 */
export const name = "dsh-handy";

export function apply(ctx) {
  ctx.logger?.debug?.("dsh-handy: browser half loaded");
}
