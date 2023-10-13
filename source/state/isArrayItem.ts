import type { State } from "./types.d.ts";

/**
 * Returns whenever the given state tree node is
 * an part of an array
 */
export function isArrayItem(
  state: State.AnyNode
): state is State.ArrayItemNode<State.AnyNode> {
  return (state as State.ArrayItemNode<State.AnyNode>)._isArrayItem || false;
}
