/** Global in-flight counter for API + short route transition indicator. */

let depth = 0;
const listeners = new Set();

function emit() {
  for (const l of listeners) l(depth);
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(depth);
  return () => listeners.delete(listener);
}

export function beginRequest() {
  depth += 1;
  emit();
}

export function endRequest() {
  depth = Math.max(0, depth - 1);
  emit();
}

/** Brief pulse when the SPA route changes (covers non-axios navigations). */
export function beginRoutePulse() {
  depth += 1;
  emit();
  window.setTimeout(() => {
    depth = Math.max(0, depth - 1);
    emit();
  }, 380);
}
