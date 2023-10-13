import React from "react";
import { Box, Text } from "ink";
import { useScreenSize } from "./_useScreenSize.js";
import { useEditorState } from "./_useEditorState.js";

// TODO: document

export const Header: React.FC = () => {
  const screen = useScreenSize();
  const [{ currentPath }] = useEditorState();

  let title = currentPath.toString();
  title =
    " ".repeat(Math.max(0, (screen.width - title.length) / 2)) +
    title +
    " ".repeat(Math.max(0, (screen.width - title.length) / 2));
  title = title + (title.length < screen.width ? " " : "");

  return (
    <Box justifyContent="center" width={screen.width} height={1} flexShrink={0}>
      <Text backgroundColor="magenta" color="white" wrap="truncate-end" bold>
        {title}
      </Text>
    </Box>
  );
};
