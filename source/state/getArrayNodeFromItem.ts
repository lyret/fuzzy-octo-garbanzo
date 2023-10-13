import type { State } from "./types.d.ts";
import { getStateFromPath } from "./getStateFromPath.js";

/**
 * Returns the array node that the given array item node
 * is a part of, if its available from the root state node
 */
export function getArrayNodeFromItem(
  state: State.ArrayItemNode<State.AnyNode>,
  rootState: State.AnyNode
): State.ArrayNode | undefined {
  return getStateFromPath(rootState, state._pathToArray) as State.ArrayNode;
}
