import { useEffect, useState } from "react";
import { useInput, useApp } from "ink";
import { paths } from "../state/index.js";
import { EditorState, StateUpdateMethod } from "./_useEditorState.js";

// TOOD: respect default values, on booleans etc

/**
 * Allows for the control and updates of the editor state
 * in a terminal interface using the keyboard
 */
export function useEditorInput(
  { currentPath, currentState, allPaths, mode }: EditorState,
  update: StateUpdateMethod
) {
  const { exit } = useApp();

  return useInput((input, key) => {
    update({ debug: JSON.stringify(allPaths) });
    // Enter a line break if editing and pressing shift enter
    if (
      key.ctrl &&
      input.toLowerCase() == "n" &&
      mode == "editing" &&
      currentState &&
      currentState.type != "boolean"
    ) {
      update({ value: currentState.value + "\nlol" });
      return;
    }
    // Stop editing on enter or escape
    if (
      (key.return || key.escape) &&
      mode == "editing" &&
      currentState &&
      currentState.type != "boolean"
    ) {
      update({ mode: "viewing" });
      return;
    }

    // Begin editing on enter key, or go deeper in the state node tree
    if (key.return && currentState) {
      // Edit a boolean value
      if (currentState.type == "boolean") {
        // Switch the boolean value
        update({ value: !currentState.value, mode: "editing" });
        // This makes the field flash as being edited for a short period
        setTimeout(() => {
          update({ mode: "viewing" });
        }, 200);
        return;
      }
      // Edit a textical och numerical value
      if (currentState.type == "string" || currentState.type == "number") {
        update({ mode: "editing" });
        return;
      }
      // Go deeper in an object or array node
      if (currentState.type == "object" || currentState.type == "array") {
        const childPath = paths.getFirstChildPath(currentPath, allPaths);
        if (childPath) {
          update({ currentPath: childPath });
        }
        return;
      }
    }

    if (mode == "viewing") {
      if (input === "q") {
        return exit();
      }
      if (key.leftArrow || key.escape) {
        const parentPath = paths.getParentPath(currentPath, allPaths);
        if (parentPath) {
          update({ currentPath: parentPath });
        }
      }
      if (key.rightArrow) {
        const childPath = paths.getFirstChildPath(currentPath, allPaths);
        if (childPath) {
          update({ currentPath: childPath });
        }
      }
      if (key.downArrow) {
        const nextPath =
          paths.getNextSiblingPath(currentPath, allPaths) ||
          paths.getFirstSiblingPath(currentPath, allPaths) ||
          paths.getFirstChildPath(currentPath, allPaths);
        if (nextPath) {
          update({ currentPath: nextPath });
        }
      }
      if (key.upArrow) {
        const prevPath =
          paths.getPreviousSiblingPath(currentPath, allPaths) ||
          paths.getLastSiblingPath(currentPath, allPaths) ||
          paths.getParentPath(currentPath, allPaths);
        if (prevPath) {
          update({ currentPath: prevPath });
        }
      }
    }
  });
}
