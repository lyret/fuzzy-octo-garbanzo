import type { State } from "./types.d.ts";

/**
 * Returns a list of all the possible paths in the given state tree
 */
export function getPathsFromState(
  state: State.AnyNode,
  paths: Array<State.Path> = []
): Array<State.Path> {
  // Add the path to the current state
  paths = [...paths, state._path];

  // Recursively add all the paths available from a object node
  if (state.type == "object") {
    for (const node of Array.from(state.value.values())) {
      paths = getPathsFromState(node, paths);
    }
  }
  // Recursively add all the paths available from an array node
  else if (state.type == "array") {
    for (const node of state.value) {
      paths = getPathsFromState(node, paths);
    }
  }

  // Return the paths
  return paths;
}
