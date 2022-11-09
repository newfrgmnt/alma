import { v4 as uuid } from "uuid";
import { assign, defMain, Sym, Type } from "@thi.ng/shader-ast";
import { makeObservable, observable } from "mobx";
import { defaults } from "lodash";
import { IContextProps } from "./Context.types";
import { ArtboardNode } from "../../nodes/core/ArtboardNode/ArtboardNode";
import { Node } from "../Node/Node";
import { Connection } from "../Connection/Connection";
import { Input } from "../Input/Input";
import { Output } from "../Output/Output";
import { INodeSerialized, NodeType } from "../Node/Node.types";
import { IConnectionSerialized } from "../Connection/Connection.types";
import { SimplexNoiseNode } from "../../nodes/noise/SimplexNoiseNode/SimplexNoiseNode";
import { Port } from "../Port/Port";
import { UVNode } from "../../nodes/core/UVNode/UVNode";
import { TimeNode } from "../../nodes/core/TimeNode/TimeNode";

export class Context {
  /** Unique Identifier */
  id: string;
  /** Context Name */
  name: string;
  /** Root Node */
  root: ArtboardNode;
  /** Nodes */
  nodes: Map<Node["id"], Node>;
  /** Connections */
  connections: Map<Connection<any>["id"], Connection<any>>;

  constructor({ target, uniforms, ...contextProps }: IContextProps) {
    const { id, name, nodes, connections } = defaults(contextProps, {
      id: uuid(),
      name: "Untitled",
      nodes: [],
      connections: [],
    });

    this.id = id;
    this.name = name;
    this.nodes = new Map();
    this.connections = new Map();

    this.root = this.initialize(nodes, connections);

    makeObservable(this, {
      id: observable,
      name: observable,
      root: observable,
      uniforms: observable,
      nodes: observable,
      connections: observable,
    });
  }

  /** Initializes Context */
  private initialize(
    nodes: [string, INodeSerialized][],
    connections: [string, IConnectionSerialized<any>][]
  ): ArtboardNode {
    const portCache = new Map<Port<any, Node>["id"], Port<any, Node>>();

    for (const [_, nodeProps] of nodes) {
      const node = this.resolveNode(nodeProps);

      if (node) {
        this.add(node);
        node.ports.forEach((port) => portCache.set(port.id, port));
      }
    }

    for (const [_, connectionProps] of connections) {
      const id = connectionProps.id;
      const from = portCache.get(connectionProps.from) as Output<any, Node>;
      const to = portCache.get(connectionProps.to) as Input<any, Node>;

      if (id && from && to) {
        const connection = new Connection(this, { id, from, to });
        this.connections.set(connection.id, connection);
      }
    }

    const root = [...this.nodes.values()].find(
      (node) => node instanceof ArtboardNode
    ) as ArtboardNode;

    if (root) {
      return root;
    } else {
      const artboardNode = new ArtboardNode(this);
      this.add(artboardNode);

      return artboardNode;
    }
  }

  /** Resolve Node */
  private resolveNode(props: INodeSerialized) {
    switch (props.type) {
      case NodeType.ARTBOARD:
        return new ArtboardNode(this, props);
      case NodeType.PERLIN_NOISE:
        return new SimplexNoiseNode(this, props);
      case NodeType.TIME:
        return new TimeNode(this, props);
      case NodeType.UV:
        return new UVNode(this, props);
    }
  }

  /** Adds node to context */
  public add(node: Node) {
    this.nodes.set(node.id, node);
  }

  /** Connects output with input */
  public connect<
    TType extends Type,
    TOutputNode extends Node,
    TOutput extends Output<TType, TOutputNode>,
    TInputNode extends Node,
    TInput extends Input<TType, TInputNode>
  >(output: TOutput, input: TInput) {
    const connection = new Connection(this, { from: output, to: input });
    this.connections.set(connection.id, connection);
  }

  /** Render Context */
  public render(outs: Record<string, Sym<any>>) {
    const value = this.root.resolveValue(this.root.inputs.color.value);

    return [
      defMain(() => [
        assign(outs.fragColor, "args" in value ? value() : value),
      ]),
    ];
  }

  /** Serializes Context */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      nodes: this.nodes,
      connections: this.connections,
    };
  }
}