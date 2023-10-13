import type { State } from "./types.d.ts";
import { z } from "zod";
import { generateStateNode } from "./_generateStateNode.js";

/**
 * Takes a validation schema, and optionally a value object matching the schema,
 * and returns a state tree that can be used by the editor to generate
 */
export async function generateEditorState<
  S extends z.ZodTypeAny,
  V extends z.infer<S>
>(rootName: string, schema: S, value: V): Promise<State.AnyNode> {
  const rootNode = await generateStateNode(rootName, schema, {
    path: [],
    value: value,
  });

  return rootNode;
}
