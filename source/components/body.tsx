import React, { useRef, useState, useEffect } from "react";
import { Box, Text, measureElement, BoxProps, useInput } from "ink";
import { ResponsiveBox } from "./_boxes.js";
import { useEditorState } from "./_useEditorState.js";
import { paths } from "../state/index.js";

// TODO: document

export const Body: React.FC<
  React.PropsWithChildren<{ width: BoxProps["width"]; height: number }>
> = ({ width, height, children }) => {
  const [{ currentRowOffset }, update] = useEditorState();

  const [scrollTop, setScrollTop] = React.useState<number>(0);
  const [innerHeight, setInnerHeight] = React.useState<number>(0);
  const [overflowHeight, setOverflowHeight] = React.useState<number>(0);

  useEffect(() => {
    if (!overflowHeight) {
      setScrollTop(0);
      return;
    }
    if (currentRowOffset >= height) {
      setScrollTop(Math.max(0, scrollTop - 1));
    }
    if (currentRowOffset <= scrollTop) {
      setScrollTop(Math.min(innerHeight - height, scrollTop + 1));
    }
    update({
      debug: JSON.stringify({
        scrollTop,
        overflowHeight,
        innerHeight,
        height,
        currentRowOffset,
      }),
    });
  }, [currentRowOffset, scrollTop]);

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
