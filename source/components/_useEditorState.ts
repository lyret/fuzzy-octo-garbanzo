import React, { useContext, useEffect, useState } from "react";
import { z } from "zod";
import {
  generateEditorState,
  getPathsFromState,
  getStateFromPath,
  paths,
  State,
} from "../state/index.js";

/** State available for components using the hook */
export type EditorState = {
  /** The current mode the editor is in */
  mode: "unloaded" | "viewing" | "editing";
  /** The root state tree node, if loaded */
  rootState: State.AnyNode | undefined;
  /** The currently selected state tree node, if any is selected */
  currentState: State.AnyNode | undefined;
  /** The path to the currently selected state node */
  currentPath: State.Path;
  /** All paths available from the root state tree */
  allPaths: Array<State.Path>;
  /** Key used for re-rendering the editor fields when a value is changed */
  refreshKey: number;
  /**
   * The row offset from 0 where the currently selected state is
   * rendered in the terminal interface */
  currentRowOffset: number;
  /** Any debug message to output in the status bar */
  debugMessage: string | undefined;
};

/** Defines what keys are updatable using the update method */
type UpdatableEditorState = {
  /** Update the node that is the root of the state tree */
  rootState: State.AnyNode;
  /** Updates the currently selected path */
  currentPath: State.Path;
  /** Updates the value of the currently selected node */
  value: State.AnyNode["value"];
  /** Sets the debug message of the editor state */
  debug: EditorState["debugMessage"];
  /** Sets the current mode of the editor */
  mode: EditorState["mode"];
  /** Sets the row offset of the included path */
  rowOffset: { path: State.Path; rowOffset: number };
};

/** Update method supplied from the use state hook */
export type StateUpdateMethod = (
  newState: Partial<UpdatableEditorState>
) => void;

/**
 * Creates and manages the editor state from the given validation
 * schema and value object
 */
export function createEditorState<S extends z.ZodTypeAny, V extends z.infer<S>>(
  schema: S,
  value: Partial<V>
): [EditorState, StateUpdateMethod] {
  const [rootState, updateRootState] = useState<State.AnyNode | undefined>(
    undefined
  );
  const [currentState, updateCurrentState] = useState<
    State.AnyNode | undefined
  >(undefined);
  const [mode, updateMode] = useState<EditorState["mode"]>("unloaded");
  const [debugMessage, updateDebugMessage] =
    useState<EditorState["debugMessage"]>(undefined);
  const [currentPath, updateCurrentPath] = useState<State.Path>([]);
  const [allPaths, updateAllPaths] = useState<Array<State.Path>>([[]]);
  const [pathRowOffsets, updatePathRowOffsets] = useState(
    new Map<State.Path, number>()
  );
  const [currentRowOffset, updateCurrentRowOffset] = useState(0);
  const [refreshKey, updateRefreshKey] = useState(0);

  // Update the state from the given validation schema and value object when changed
  useEffect(() => {
    generateEditorState("", schema, value).then((state) => {
      updateRootState(state);
    });
  }, [schema, value]);

  // Update the available paths when the state tree changes
  useEffect(() => {
    if (rootState) {
      updateAllPaths(getPathsFromState(rootState));
    }
  }, [rootState]);

  // Update the mode between viewing and unloaded the state tree changes
  // to, or from, undefined
  useEffect(() => {
    if (rootState && mode == "unloaded") {
      updateMode("viewing");
    } else {
      updateMode("unloaded");
    }
  }, [rootState]);

  // Update the current path when the available paths changes
  useEffect(() => {
    updateCurrentPath(allPaths[0] || []);
  }, [allPaths]);

  // Update the current state when the current path changes
  useEffect(() => {
    if (rootState) {
      updateCurrentState(getStateFromPath(rootState, currentPath));
    } else {
      updateCurrentState(undefined);
    }
  }, [currentPath, rootState]);

  // Update the directory of row offset for each path when the
  // available paths change
  useEffect(() => {
    const newMap = new Map<State.Path, number>();
    allPaths.map((path) => newMap.set(path, 0));
    updatePathRowOffsets(newMap);
  }, [allPaths]);

  // Update the current row offset when the current path changes
  useEffect(() => {
    if (currentPath) {
      const stop = paths.getIndex(currentPath, allPaths);
      let offset = 0;
      for (let i = 0; i < stop; i++) {
        offset += pathRowOffsets.get(allPaths[i]) || 0;
      }
      updateCurrentRowOffset(offset);
    }
  }, [currentPath, pathRowOffsets]);

  // Return the state of the editor and update methods
  return [
    {
      rootState,
      currentState,
      currentPath,
      allPaths,
      refreshKey,
      mode,
      debugMessage,
      currentRowOffset,
    },
    (newState) => {
      for (const key of Object.keys(newState)) {
        switch (key as keyof UpdatableEditorState) {
          case "mode":
            updateMode(newState["mode"] || "viewing");
            break;
          case "debug":
            updateDebugMessage(newState["debug"]);
            break;
          case "rootState":
            updateRootState(newState["rootState"]);
            break;
          case "currentPath":
            updateCurrentPath(newState["currentPath"]!);
            break;
          case "rowOffset":
            pathRowOffsets.set(
              newState["rowOffset"]!.path,
              newState["rowOffset"]!.rowOffset
            );
            updatePathRowOffsets(pathRowOffsets);
            break;
          case "value":
            if (currentState) {
              currentState.value = newState["value"];
              updateRefreshKey(Math.random());
            }
            break;
        }
      }
    },
  ];
}

/**
 * Context containing the editor state
 * used by the editor component used to make the state
 * available in child components
 */
export const EditorStateContext = React.createContext<
  [EditorState, StateUpdateMethod]
>([
  {
    rootState: undefined,
    currentState: undefined,
    allPaths: [],
    currentPath: [],
    refreshKey: 0,
    mode: "unloaded",
    debugMessage: undefined,
    currentRowOffset: 0,
  },
  () => {},
]);

/**
 * Keeps track of, and allows for the control and updates of a editor state
 * in the terminal interface
 */
export function useEditorState() {
  return useContext(EditorStateContext);
}
