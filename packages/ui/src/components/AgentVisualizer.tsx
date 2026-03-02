import { useEffect, useState } from "react";
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
  MiniMap,
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

const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 260;
const FRAME_X_GAP = 80;
const NODE_Y_GAP = 32;

function toFlowNodesByFrame(frameList: Frame[], upToIndex: number): Node[] {
  const nodes: Node[] = [];
  const maxIndex = Math.min(upToIndex, frameList.length - 1);

  for (let frameIdx = 0; frameIdx <= maxIndex; frameIdx++) {
    const frame = frameList[frameIdx];
    const x = frameIdx * (DEFAULT_NODE_WIDTH + FRAME_X_GAP);

    for (let nodeIdx = 0; nodeIdx < frame.nodes.length; nodeIdx++) {
      const n = frame.nodes[nodeIdx];
      const y = nodeIdx * (DEFAULT_NODE_HEIGHT + NODE_Y_GAP);

      nodes.push({
        id: n.id,
        type: n.type,
        width: DEFAULT_NODE_WIDTH,
        height: DEFAULT_NODE_HEIGHT,
        position: { x, y },
        data: { ...n.data },
      });
    }
  }

  return nodes;
}

function toFlowEdges(_agentNodes: AgentNode[]): Edge[] {
  return [];
}

function AgentVisualizerInner({ frames }: AgentVisualizerProps) {
  const frameList = Array.isArray(frames) ? frames : [frames];
  const [frameIndex, setFrameIndex] = useState(0);

  const clampedIndex =
    frameList.length === 0 ? 0 : Math.min(frameIndex, frameList.length - 1);
  const totalNodesUpToFrame = frameList
    .slice(0, clampedIndex + 1)
    .reduce((acc, f) => acc + f.nodes.length, 0);

  const initialNodes = totalNodesUpToFrame ? toFlowNodesByFrame(frameList, clampedIndex) : [];
  const initialEdges = totalNodesUpToFrame ? toFlowEdges([]) : []; // TODO: Add edges

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
    if (totalNodesUpToFrame === 0) return;
    const flowNodes = toFlowNodesByFrame(frameList, clampedIndex);
    const flowEdges = toFlowEdges([]); // TODO: Add edges
    setNodes(flowNodes);
    setEdges(flowEdges);
    requestAnimationFrame(() => fitView());
  }, [clampedIndex, fitView, frames]);

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
        <MiniMap />
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
