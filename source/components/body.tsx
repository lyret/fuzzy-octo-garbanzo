import React, { useRef, useState, useEffect } from "react";
import { Box, Text, measureElement, BoxProps, useInput } from "ink";
import { ResponsiveBox } from "./_boxes.js";
import { useEditorState } from "./_useEditorState.js";
import { paths } from "../state/index.js";

// TODO: document

export const Body: React.FC<
  React.PropsWithChildren<{ width: BoxProps["width"]; height: number }>
> = ({ width, height, children }) => {
  const [{ currentPath, allPaths }, update] = useEditorState();

  const [scrollTop, setScrollTop] = React.useState<number>(0);
  const [innerHeight, setInnerHeight] = React.useState<number>(0);
  const [overflowHeight, setOverflowHeight] = React.useState<number>(0);

  useEffect(() => {
    if (!overflowHeight) {
      setScrollTop(0);
      return;
    }
    setScrollTop(
      Math.max(0, paths.getIndex(currentPath, allPaths) - overflowHeight)
    );
    update({
      debug: JSON.stringify({ scrollTop: scrollTop, overflow: overflowHeight }),
    });
  }, [currentPath]);

  useInput((_input, key) => {
    //     if (!overflowHeight) {
    //       return;
    //     }
    //     if (key.downArrow) {
    //       setScrollTop(Math.min(innerHeight - height, scrollTop + 1));
    //     }
    //
    //     if (key.upArrow) {
    //       setScrollTop(Math.max(0, scrollTop - 1));
    //     }
  });

  useEffect(() => {
    setOverflowHeight(Math.max(0, -(height - innerHeight)));
  }, [height, innerHeight]);

  return (
    <Box flexDirection="column" overflow="hidden" width={width} height={height}>
      <ResponsiveBox
        flexDirection="column"
        flexShrink={0}
        marginTop={-scrollTop}
        onMeasurement={({ height }) => {
          setInnerHeight(height);
        }}
      >
        {children}
      </ResponsiveBox>
    </Box>
  );
};
