import type { State } from "./types.d.ts";
import { z } from "zod";

// Type guards

function isZodZodPipeline(schema: any): schema is z.ZodPipeline<any, any> {
  return schema._def.typeName == "ZodPipeline";
}
function isZodObject(schema: any): schema is z.ZodObject<any> {
  return schema.shape;
}
function isZodArray(schema: any): schema is z.ZodArray<any> {
  return schema._def.typeName == "ZodArray" && schema._def.type;
}
function hasZodInnerType(schema: any): schema is z.ZodNullable<any> {
  return schema._def.innerType;
}

/** Marks the given state node as an array item */
function markAsArrayItem<T extends State.AnyNode>(
  node: T,
  pathToArrayNode: State.Path
): State.ArrayItemNode<T> {
  return { ...node, _isArrayItem: true, _pathToArray: pathToArrayNode };
}

/**
 * Recursive function that generates a node
 * for the editor state tree.
 * The value, description, default value etc is
 * determined from the given validation schema.
 * The parameters argument is used to pass forward
 * data between recursive calls.
 */
export async function generateStateNode<
  S extends z.ZodObject<any> | z.ZodDefault<any> | z.ZodTypeAny,
  V extends z.infer<S>
>(
  /**
   * Name of the field in the data object that this
   * state node corresponds to
   */
  name: string,
  /** Validation schema to use */
  schema: S,
  /** Parameters for the generated nodes */
  params: {
    /** Path to this node from the root of the state */
    path: Array<string>;
    /** Default value to set on the generated node */
    default?: any;
    /** Description value to set on the generated node */
    description?: string;
    /** Data value to set on the generated node */
    schema?: S;
    /** Validation schema to set on the generated node */
    value?: V;
  }
): Promise<State.AnyNode> {
  // Add any description added to the validation schema
  params.description =
    params.description || schema._def.description || undefined;
  // Add any default value added to the validation schema
  params.default =
    params.default !== undefined
      ? params.default
      : schema._def.defaultValue
      ? schema._def.defaultValue()
      : undefined;

  // Check if this Zod Type has an inner type to handle
  // Make sure to keep current default value, description and
  // the original schema for validation
  if (hasZodInnerType(schema)) {
    params.schema = params.schema || schema;
    return generateStateNode(name, schema._def.innerType, params);
  }

  // Handle pipelines by parsing the out object
  // Make sure to keep current default value, description and
  // the original schema for validation
  if (isZodZodPipeline(schema)) {
    params.schema = params.schema || schema;
    return generateStateNode(name, schema._def.out, params);
  }

  // Generate a array node
  if (isZodArray(schema)) {
    // Create a base item node for adding new items to the array
    const baseNode = await generateStateNode(name, schema._def.type, params);
    // Delete the data value added to the base node, as its only
    // applicable to already existing items
    baseNode.value = undefined;

    // Create a list of nodes from the supplied data values for the array
    const suppliedValues: Array<z.infer<typeof baseNode._schema>> =
      params.value && Array.isArray(params.value) ? params.value : [];
    const generatedValues: Array<State.ArrayItemNode<State.AnyNode>> = [];
    let index = 0;
    for (const value of suppliedValues) {
      const node = await generateStateNode(String(index), baseNode._schema, {
        value: value,
        path: [...params.path, name],
      });
      generatedValues.push(markAsArrayItem(node, [...params.path, name]));
      index++;
    }

    return {
      type: "array",
      name: name,
      base: markAsArrayItem(baseNode, [...params.path, name]),
      value: generatedValues,
      default: params.default,
      description: params.description,
      _path: [...params.path, name],
      _schema: params.schema || schema,
    };
  }

  // Generate a object node
  if (isZodObject(schema)) {
    // Generate a node for each field of the object schema
    // Make sure to reset params so that schemas, default values and
    // descriptions are not given from the object itself
    // Pass down given values for the field if they exist
    const fields = new Map<string, State.AnyNode>();
    for (const fieldName in schema.shape) {
      const fieldData = params.value ? params.value[fieldName] : undefined;
      const fieldConfig = await generateStateNode(
        fieldName,
        schema.shape[fieldName],
        { value: fieldData, path: [...params.path, name] }
      );
      fields.set(fieldName, fieldConfig);
    }
    return {
      type: "object",
      name: name,
      value: fields,
      default: params.default,
      description: params.description,
      _path: [...params.path, name],
      _schema: params.schema || schema,
    };
  }

  // Generate a node for a primary value
  switch (schema._def.typeName) {
    // String
    case "ZodString":
      return {
        type: "string",
        name: name,
        value: params.value,
        default: params.default,
        description: params.description,
        _path: [...params.path, name],
        _schema: params.schema || schema,
      };
    // Number
    case "ZodNumber":
      return {
        type: "number",
        name: name,
        value: params.value,
        default: params.default,
        description: params.description,
        _path: [...params.path, name],
        _schema: params.schema || schema,
      };
    // Boolean
    case "ZodBoolean":
      return {
        type: "boolean",
        name: name,
        value: params.value,
        default: params.default,
        description: params.description,
        _path: [...params.path, name],
        _schema: params.schema || schema,
      };
    default:
      throw new Error(
        "Unable to generate a state node from the given validation schema of type " +
          schema._def.typeName
      );
  }
}
