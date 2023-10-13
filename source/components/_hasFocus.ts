import { State } from "../state/index.js";
import { useEditorState } from "./_useEditorState.js";

/**
 * Determines if the given state has focus in the editor,
 * returns true also if a child of the given state is selected.
 * @param exact if given, returns true only if the state path
 * matches exactly
 */
export function hasFocus(state: State.AnyNode, exact?: true) {
  const [{ currentPath }] = useEditorState();

  if (exact) {
    return state._path.toString() == currentPath.toString();
  }

  for (let i = 0; i < currentPath.length; i++) {
    if (i >= state._path.length) {
      return false;
    }
    if (state._path[i] != currentPath[i]) {
      return false;
    }
  }
  return true;
}
