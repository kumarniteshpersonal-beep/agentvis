import { useEffect, useState } from "react";
import * as Dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MessageNode from "./nodes/MessageNode";

export type MessageType =
  | "AIMessage"
  | "ToolMessage"
  | "HumanMessage"
  | "SystemMessage";

export interface AgentNode {
  id: string;
  type: MessageType;
  data?: Record<string, unknown>;
}

export interface Frame {
  nodes: AgentNode[];
}

export interface AgentVisualizerProps {
  frames: Frame | Frame[];
}

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 40;

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.measured?.width ?? DEFAULT_NODE_WIDTH,
      height: node.measured?.height ?? DEFAULT_NODE_HEIGHT,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id);
      const w = node.measured?.width ?? DEFAULT_NODE_WIDTH;
      const h = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
      return { ...node, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
    }),
    edges,
  };
}

function toFlowNodes(agentNodes: AgentNode[]): Node[] {
  return agentNodes.map((n, i) => ({
    id: n.id,
    type: n.type,
    position: { x: 0, y: i * 80 },
    data: { ...n.data},
  }));
}

function toFlowEdges(_agentNodes: AgentNode[]): Edge[] {
  return [];
}

function getCumulativeNodes(frameList: Frame[], upToIndex: number): AgentNode[] {
  const cumulative: AgentNode[] = [];
  for (let i = 0; i <= upToIndex && i < frameList.length; i++) {
    cumulative.push(...frameList[i].nodes);
  }
  return cumulative;
}

function AgentVisualizerInner({ frames }: AgentVisualizerProps) {
  const frameList = Array.isArray(frames) ? frames : [frames];
  const [frameIndex, setFrameIndex] = useState(0);

  const clampedIndex =
    frameList.length === 0 ? 0 : Math.min(frameIndex, frameList.length - 1);
  const cumulativeNodes = getCumulativeNodes(frameList, clampedIndex);

  const initialNodes = cumulativeNodes.length ? toFlowNodes(cumulativeNodes) : [];
  const initialEdges = cumulativeNodes.length ? toFlowEdges([]) : []; // TODO: Add edges

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const onPrev = () => {
    setFrameIndex((idx) => Math.max(0, idx - 1));
  };

  const onNext = () => {
    if (frameList.length === 0) return;
    setFrameIndex((idx) => Math.min(frameList.length - 1, idx + 1));
  };

  useEffect(() => {
    if (!cumulativeNodes.length) return;
    const flowNodes = toFlowNodes(cumulativeNodes);
    const flowEdges = toFlowEdges([]); // TODO: Add edges
    const layouted = getLayoutedElements(flowNodes, flowEdges, "TB");
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    requestAnimationFrame(() => fitView());
  }, [clampedIndex, fitView, frameList.length]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
        nodeTypes={{ HumanMessage: MessageNode, AIMessage: MessageNode, ToolMessage: MessageNode, SystemMessage: MessageNode }}
      >
        <Background />
        <Panel position="bottom-left">
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={onPrev}
              className="nodrag"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                border: "1px solid #b1b1b7",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="nodrag"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                border: "1px solid #b1b1b7",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ›
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function AgentVisualizer(props: AgentVisualizerProps) {
  return (
    <ReactFlowProvider>
      <AgentVisualizerInner {...props} />
    </ReactFlowProvider>
  );
}
