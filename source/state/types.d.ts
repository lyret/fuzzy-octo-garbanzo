import type { z as Schema } from "zod";

// TODO: GENERAL DOCUMENTATION
// STATE | SCHEMA | DATA
// TODO: USE YAML NAMES FOR DATATYPE (sequence, mapping etc)

/**
 * The state of the editor is structured as a tree of
 * nodes for each key/value item in the data object.
 * The nodes contain the value along with the typical
 * information needed to render, validate and otherwise
 * modify the data.
 */
export namespace State {
  /** Any node in the editor state tree */
  type AnyNode = AnyValueNode | AnyForkNode;

  /** Any node that contains sub-nodes in either a list or map */
  type AnyForkNode = ArrayNode | ObjectNode;

  /** Any primary value node */
  type AnyValueNode = StringNode | NumberNode | BooleanNode;

  /** The format of paths for navigating in the state tree */
  type Path = AnyNode["_path"];

  /** Common editor configuration for the given type */
  type BaseEditorNode<T> = {
    /** The name of this node, represents the key of the corresponding value in the data object */
    name: string;
    /** (Optional] Description of what this key/value represents */
    description?: string;
    /** Current value, if any */
    value?: T;
    /** (Optional) default value if none is given */
    default?: T;
    /** Zod schema used for validation */
    _schema: Schema.ZodTypeAny;
    /** Path to this node from the root of the state */
    _path: Array<string>;
  };

  /** Any node that is part of an array */
  type ArrayItemNode<ItemNode extends BaseEditorNode<any>> = {
    /** Indicates that this node is a part of an array, used for rendering the editor */
    _isArrayItem?: true;
    /** The path to the array this node is an item in */
    _pathToArray: Path;
  } & ItemNode;

  /** A node for a textual value */
  type StringNode = {
    /** This is a editor node for a textual value */
    type: "string";
  } & BaseEditorNode<string>;

  /** A node for a numerical value */
  type NumberNode = {
    /** This is a editor node for a numerical value */
    type: "number";
  } & BaseEditorNode<number>;

  /** A node for a boolean value */
  type BooleanNode = {
    /** This is a editor node for a boolean value */
    type: "boolean";
  } & BaseEditorNode<boolean>;

  /** A node describing a field that contains a list of iterable nodes */
  type ArrayNode = {
    /** This is the node for an array */
    type: "array";
    /** A node with common options for any item in the value array, used for adding additional values to the array */
    base: ArrayItemNode<AnyNode>;
    /** An arrays value is a list of nodes for each added item in the array */
    value: Array<ArrayItemNode<AnyNode>>;
  } & Omit<BaseEditorNode<Array<ArrayItemNode<AnyNode>>>, "value">;

  /** A node describing an object with one or more key/value pairs of values */
  type ObjectNode = {
    /** This is the node for an object */
    type: "object";
    /** An objects is value is a map with nodes for each added key/value pair */
    value: Map<string, AnyNode>;
  } & Omit<BaseEditorNode<Object>, "value">;
}
