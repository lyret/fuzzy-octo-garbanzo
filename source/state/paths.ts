import type { State } from "./types.d.ts";

/** Gets the index of a path in the given list of paths */
function getIndex(searchPath: State.Path, allPaths: Array<State.Path>): number {
  return allPaths.findIndex((path) => path.toString() == searchPath.toString());
}

/** Return the path back to the parent path in the given list of paths, if possible */
export function getParentPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const parentIndex = allPaths.findLastIndex((path, index) => {
    return (
      path.toString() == currentPath.slice(0, -1).toString() &&
      index < currentPathIndex
    );
  });
  if (parentIndex > -1) {
    return allPaths[parentIndex];
  }
}

/** Return the path to the first child path of the given path in the list of paths, if possible */
export function getFirstChildPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const childIndex = allPaths.findIndex((path, index) => {
    return (
      path.slice(0, currentPath.length).toString() == currentPath.toString() &&
      index > currentPathIndex
    );
  });
  if (childIndex > -1) {
    return allPaths[childIndex];
  }
}

/** Returns the path back to the previous sibling path of the current path, if possible */
export function getPreviousSiblingPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const siblingIndex = allPaths.findLastIndex((path, index) => {
    return (
      path.slice(0, -1).toString() == currentPath.slice(0, -1).toString() &&
      path.length == currentPath.length &&
      index < currentPathIndex
    );
  });
  if (siblingIndex > -1) {
    return allPaths[siblingIndex];
  }
}

/** Returns the path to the next sibling path of the current path, if possible */
export function getNextSiblingPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const siblingIndex = allPaths.findIndex((path, index) => {
    return (
      path.slice(0, -1).toString() == currentPath.slice(0, -1).toString() &&
      path.length == currentPath.length &&
      index > currentPathIndex
    );
  });
  if (siblingIndex > -1) {
    return allPaths[siblingIndex];
  }
}

/** Returns the path to the first sibling path of the current path, if its not the same as the current path */
export function getFirstSiblingPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const siblingIndex = allPaths.findIndex((path, index) => {
    return (
      path.slice(0, -1).toString() == currentPath.slice(0, -1).toString() &&
      path.length == currentPath.length &&
      index != currentPathIndex
    );
  });
  if (siblingIndex > -1) {
    return allPaths[siblingIndex];
  }
}

/** Returns the path to the last sibling path of the current path, if its not the same as the current path */
export function getLastSiblingPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  const siblingIndex = allPaths.findLastIndex((path, index) => {
    return (
      path.slice(0, -1).toString() == currentPath.slice(0, -1).toString() &&
      path.length == currentPath.length &&
      index != currentPathIndex
    );
  });
  if (siblingIndex > -1) {
    return allPaths[siblingIndex];
  }
}

/** Returns the previous path of the current path in the list of all paths, if possible */
export function getPreviousPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  if (currentPathIndex - 1 > 0) {
    return allPaths[currentPathIndex - 1];
  }
}

/** Returns the next path after the current path in the list of all paths */
export function getNextPath(
  currentPath: State.Path,
  allPaths: Array<State.Path>
): State.Path | undefined {
  const currentPathIndex = getIndex(currentPath, allPaths);
  if (currentPathIndex + 1 <= allPaths.length - 1) {
    return allPaths[currentPathIndex + 1];
  }
}

/** Returns the first path in the list of all paths */
export function getFirstPath(
  allPaths: Array<State.Path>
): State.Path | undefined {
  return allPaths[0];
}

/** Returns the last path in the list of all paths */
export function getLastPath(
  allPaths: Array<State.Path>
): State.Path | undefined {
  if (allPaths.length) {
    return allPaths[allPaths.length - 1];
  }
}
