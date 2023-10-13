import React from "react";
import { Box, Text } from "ink";
import { useEditorState } from "./_useEditorState.js";

// TODO: document

export const Footer: React.FC = () => {
  const [{ currentState, currentPath, debugMessage }] = useEditorState();

  // TODO: Validation code for values are here right now
  let validation = "";
  if (currentState && currentState.type == "string") {
    const res = currentState._schema.safeParse(currentState.value);
    if (res.success) {
      validation = "ok!";
    } else {
      validation = res.error.flatten().formErrors.toString();
    }
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      marginLeft={2}
      marginRight={2}
    >
      <Text>Tryck 'q' för att avsluta</Text>
      <Text>Type: {currentState ? currentState.type : ""}</Text>
      <Text>Value: {currentState ? String(currentState.value) : ""}</Text>
      <Text>Path: {currentPath.toString()}</Text>
      <Text>Validation: {validation}</Text>
      {debugMessage && <Text>DEBUG: {debugMessage}</Text>}
    </Box>
  );
};
