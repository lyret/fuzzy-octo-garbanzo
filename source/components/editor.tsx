import React from "react";
import { z } from "zod";
import { Box, Text, measureElement, useInput } from "ink";
import { createEditorState, EditorStateContext } from "./_useEditorState.js";
import { useEditorInput } from "./_useEditorInput.js";
import { useScreenSize } from "./_useScreenSize.js";
import { StatusBar } from "./statusBar.js";
import { Field } from "./field.js";

// TODO: document
// TODO: fix fullscreen

export function Editor<S extends z.ZodTypeAny, V extends z.infer<S>>({
  schema,
  value,
  useFullscreen,
}: {
  schema: S;
  value: Partial<V>;
  useFullscreen: boolean;
}): React.ReactElement {
  // Create the editor state
  const [state, updateState] = createEditorState(schema, value);

  // Enable keyboard control of the state
  //useEditorInput(state, updateState);

  // Let the editor take up the full terminal width and heigth when
  // rendering to an alternative output
  const [width, height] = useScreenSize();

  if (!state.rootState) {
    return <Text>Loading...</Text>;
  }

  let title = "We Yamling - I want to Yaml with you";
  title =
    " ".repeat((width - title.length) / 2) +
    title +
    " ".repeat((width - title.length) / 2);
  title = title + (title.length < width ? " " : "");

  //<Box flexDirection="column" paddingBottom={1}>

  // {Array.from({ length: 20 })
  //   .fill(true)
  //   .map((_, index) => (
  //     <Box key={index} flexShrink={0} borderStyle="single">
  //       <Text>Item #{index + 1}</Text>
  //     </Box>
  //   ))}

  //</Box>

  return (
    <EditorStateContext.Provider value={[state, updateState]}>
      <Box
        width={useFullscreen ? width : undefined}
        minHeight={useFullscreen ? height : undefined}
        flexDirection="column"
        justifyContent="flex-start"
      >
        <Box
          justifyContent="center"
          flexShrink={0}
          flexGrow={0}
          alignSelf="flex-start"
        >
          <Text backgroundColor="magenta" color="white" bold>
            {title}
          </Text>
        </Box>
        <Box
          width={width}
          paddingTop={1}
          flexDirection="column"
          flexGrow={1}
          overflow="hidden"
          minHeight={0}
        >
          <ScrollArea height={3}>
            <Field key={state.refreshKey} state={state.rootState} indent={0} />
          </ScrollArea>
        </Box>
        <Box flexDirection="column" flexShrink={0}>
          <StatusBar />
        </Box>
      </Box>
    </EditorStateContext.Provider>
  );
}

/////

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INNER_HEIGHT":
      return {
        ...state,
        innerHeight: action.innerHeight,
      };

    case "SCROLL_DOWN":
      return {
        ...state,
        scrollTop: Math.min(
          state.innerHeight - state.height,
          state.scrollTop + 1
        ),
      };

    case "SCROLL_UP":
      return {
        ...state,
        scrollTop: Math.max(0, state.scrollTop - 1),
      };

    default:
      return state;
  }
};

function ScrollArea({ height, children }: any) {
  const [state, dispatch] = React.useReducer(reducer, {
    height,
    scrollTop: 0,
  });

  const innerRef = React.useRef<any>();

  React.useEffect(() => {
    const dimensions = measureElement(innerRef.current);

    dispatch({
      type: "SET_INNER_HEIGHT",
      innerHeight: dimensions.height,
    });
  }, []);

  useInput((_input, key) => {
    if (key.downArrow) {
      dispatch({
        type: "SCROLL_DOWN",
      });
    }

    if (key.upArrow) {
      dispatch({
        type: "SCROLL_UP",
      });
    }
  });

  return (
    <Box height={height} flexDirection="column" overflow="hidden">
      <Box
        ref={innerRef}
        flexShrink={0}
        flexDirection="column"
        marginTop={-state.scrollTop}
      >
        {children}
      </Box>
    </Box>
  );
}
