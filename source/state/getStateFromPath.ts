import type { State } from "./types.d.ts";

/**
 * Returns the state node from the given path if its available
 * in the given state tree
 */
export function getStateFromPath(
  state: State.AnyNode,
  path: State.Path
): State.AnyNode | undefined {
  // Abort if we are searching to deep in the state tree
  if (path.length < state._path.length) {
    return undefined;
  }
  // Check for a match if we are at the correct depth
  if (path.length == state._path.length) {
    if (path.toString() == state._path.toString()) {
      return state;
    }
  }
  // Continue searching deeper in the state tree
  if (state.type == "object") {
    for (const field of Array.from(state.value.values())) {
      const node = getStateFromPath(field, path);
      if (node) {
        return node;
      }
    }
  }
  if (state.type == "array") {
    for (const item of state.value) {
      const node = getStateFromPath(item, path);
      if (node) {
        return node;
      }
    }
  }

  // No state node found
  return undefined;
}
