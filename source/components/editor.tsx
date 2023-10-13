import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Box, Text } from "ink";
import { createEditorState, EditorStateContext } from "./_useEditorState.js";
import { useEditorInput } from "./_useEditorInput.js";
import { useScreenSize } from "./_useScreenSize.js";
import { Header } from "./header.js";
import { Body } from "./body.js";
import { Field } from "./field.js";
import { Footer } from "./footer.js";
import { ResponsiveBox } from "./_boxes.js";

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
  useEditorInput(state, updateState);

  // Keep track of the dimensions of the screen
  const screen = useScreenSize();

  // Keep track of the dimensions of the header
  const [headerDimensions, setHeaderDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Keep track of the dimensions of the footer
  const [footerDimensions, setFooterDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Keep track of the dimensions of the body
  const [bodyDimensions, setBodyDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Recalculate the available space for the data area when the
  // screen size or status bar size changes
  useEffect(() => {
    setBodyDimensions({
      width: screen.width,
      height: screen.height - footerDimensions.height - headerDimensions.height,
    });
  }, [screen, headerDimensions, footerDimensions]);

  // Render
  // Disable drawing of the body and footer when the screen size is unusable
  // or when the state is unloaded
  return (
    <EditorStateContext.Provider value={[state, updateState]}>
      <Box
        width={useFullscreen ? screen.width : undefined}
        minHeight={useFullscreen ? screen.height : undefined}
        flexDirection="column"
        justifyContent="flex-start"
      >
        {state.mode == "unloaded" || !state.rootState ? null : screen.height <
          20 ? (
          <Text>The editor needs more space to render.</Text>
        ) : (
          <>
            <Body width={bodyDimensions.width} height={bodyDimensions.height}>
              <Field
                key={state.refreshKey}
                state={state.rootState}
                indent={0}
              />
            </Body>
            <ResponsiveBox
              flexDirection="column"
              flexShrink={0}
              paddingBottom={1}
              onMeasurement={setHeaderDimensions}
            >
              <Header />
            </ResponsiveBox>
            <ResponsiveBox
              flexDirection="column"
              flexShrink={0}
              paddingTop={1}
              onMeasurement={setFooterDimensions}
            >
              <Footer />
            </ResponsiveBox>
          </>
        )}
      </Box>
    </EditorStateContext.Provider>
  );
}
