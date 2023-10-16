import React, { useEffect, useRef, useState } from "react";
import { Box, Text, measureElement } from "ink";
import Input from "ink-text-input";
import { State, isArrayItem } from "../state/index.js";
import { hasFocus } from "./_hasFocus.js";
import { useEditorState } from "./_useEditorState.js";
import { useScreenSize } from "./_useScreenSize.js";
import { ResponsiveBox } from "./_boxes.js";

const PADDING_SIZE = 2;
const FOCUS_COLOR = "magenta";
const EDIT_BG_COLOR = "magenta";
const EDIT_COLOR = "white";

// TODO: document
// TODO: refactor, is not nice right now

type Props<T extends State.AnyNode = State.AnyNode> = React.PropsWithChildren<{
  state: T;
  indent: number;
  hasFocus?: boolean;
}>;

export const Field: React.FC<Props> = ({ state, indent }) => {
  const isSelected = hasFocus(state, true);
  const [{ mode }, updateState] = useEditorState();

  // Render an object state node
  if (state.type == "object") {
    // If is the root state node, decrease indent by one
    indent = state._path.length == 1 ? indent - 1 : indent;

    // if this object node is in an array, render the first first item
    // as an array item node, and the rest of the child nodes
    // with the same indentation
    const [firstChildNode, ...childNodes] = Array.from(state.value.values());
    return (
      <Column>
        {!isArrayItem(state) && indent >= 0 && (
          <FieldValue indent={indent} state={state} />
        )}
        <Field
          state={
            {
              ...firstChildNode,
              _isArrayItem: isArrayItem(state),
            } as State.ArrayItemNode<State.ObjectNode>
          }
          indent={indent + 1}
        />
        {childNodes.map((childNode) => (
          <Field key={childNode.name} state={childNode} indent={indent + 1} />
        ))}
      </Column>
    );
  }

  // Render an array state node
  if (state.type == "array") {
    return (
      <>
        <FieldValue indent={indent} state={state} />
        <Column>
          {state.value.map((node) => (
            <>
              <Field key={node.name} state={node} indent={indent + 1} />
            </>
          ))}
        </Column>
      </>
    );
  }
  // Render a state node for a textual or numerical value
  if (state.type == "string" || state.type == "number") {
    return (
      <FieldValue indent={indent} state={state}>
        {isSelected && mode == "editing" ? (
          <Text color={EDIT_COLOR} backgroundColor={EDIT_BG_COLOR}>
            <Input
              value={String(state.value)}
              onChange={(value) => updateState({ value })}
            />
          </Text>
        ) : (
          <Text>{String(state.value)}</Text>
        )}
      </FieldValue>
    );
  }
  // Render a state node for a boolean value
  if (state.type == "boolean") {
    return (
      <FieldValue indent={indent} state={state}>
        <Text
          color={isSelected && mode == "editing" ? EDIT_COLOR : undefined}
          backgroundColor={
            isSelected && mode == "editing" ? EDIT_BG_COLOR : undefined
          }
        >
          {String(state.value)}
        </Text>
      </FieldValue>
    );
  }

  throw new Error("Unable to render a node in the state tree");
};

const Column: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Box flexDirection="column">{children}</Box>;
};

const FieldValue: React.FC<Props> = ({ state, indent, children }) => {
  const [_, update] = useEditorState();

  // This field is focused in the editor
  const isFocused = hasFocus(state);

  // Do not render the key if this is the root state node, determined by having a path length of 1
  const renderKey = state._path.length != 1;

  // This is a string value with multiple lines that should be preserved
  const hasMultipleLines =
    state.type == "string" && state.value && state.value.split("\n").length > 1;

  // Keep track of the dimensions of the value box
  const [valueBoxDimensions, setValueBoxDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // The value of this field will wrap across multiple lines and should be indicated in the rendering
  const willWrap =
    state.type == "string" &&
    !hasMultipleLines &&
    state.value &&
    state.value.length >= valueBoxDimensions.width;

  // Set the row offset for this state/path when the dimensions
  // of the value box are known
  useEffect(() => {
    update({
      rowOffset: {
        path: state._path,
        rowOffset: valueBoxDimensions.height,
      },
    });
  }, [valueBoxDimensions]);

  // The rendered name of this field
  const name =
    (isArrayItem(state) ? " -" : "") +
    (Number.isNaN(Number(state.name)) ? state.name + ": " : "") +
    (hasMultipleLines ? "|" : willWrap ? ">" : "");

  // The padding that should be applied to this field
  const padding = indent * PADDING_SIZE + (isArrayItem(state) ? -2 : 0);

  // Render
  return (
    <Box flexDirection="row">
      {renderKey && (
        <Box flexDirection="column" marginLeft={padding} flexShrink={1}>
          <Text color={isFocused ? FOCUS_COLOR : undefined}>{name}</Text>
        </Box>
      )}
      <ResponsiveBox
        flexDirection="column"
        paddingRight={1}
        flexGrow={1}
        onMeasurement={setValueBoxDimensions}
      >
        <Text color={isFocused ? FOCUS_COLOR : undefined}>{children}</Text>
      </ResponsiveBox>
    </Box>
  );
};
