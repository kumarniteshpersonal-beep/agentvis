import { useCallback, useEffect, useState } from "react";
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
  MarkerType,
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

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface AgentGraph {
  frames: Frame[];
  connections: Connection[];
}
export interface AgentVisualizerProps {
  graph: AgentGraph;
}

const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 260;
const FRAME_X_GAP = 80;
const NODE_Y_GAP = 32;

const EDGE_COLOR = "#CBD5E1";
const EDGE_HOVER_COLOR = "#E0531F";

type ConnectionInfo = {
  hasSource: boolean;
  hasTarget: boolean;
};

type ConnectionMap = Record<string, ConnectionInfo>;

function buildConnectionMap(connections: Connection[]): ConnectionMap {
  const map: ConnectionMap = {};

  for (const c of connections) {
    if (!map[c.source]) {
      map[c.source] = { hasSource: false, hasTarget: false };
    }
    if (!map[c.target]) {
      map[c.target] = { hasSource: false, hasTarget: false };
    }

    map[c.source].hasSource = true;
    map[c.target].hasTarget = true;
  }

  return map;
}

function toFlowNodesByFrame(
  frameList: Frame[],
  upToIndex: number,
  connectionMap: ConnectionMap,
): Node[] {
  const nodes: Node[] = [];
  const maxIndex = Math.min(upToIndex, frameList.length - 1);

  for (let frameIdx = 0; frameIdx <= maxIndex; frameIdx++) {
    const frame = frameList[frameIdx];
    const x = frameIdx * (DEFAULT_NODE_WIDTH + FRAME_X_GAP);

    for (let nodeIdx = 0; nodeIdx < frame.nodes.length; nodeIdx++) {
      const n = frame.nodes[nodeIdx];
      const y = nodeIdx * (DEFAULT_NODE_HEIGHT + NODE_Y_GAP);

      const info = connectionMap[n.id];

      nodes.push({
        id: n.id,
        type: n.type,
        width: DEFAULT_NODE_WIDTH,
        height: DEFAULT_NODE_HEIGHT,
        position: { x, y },
        data: {
          ...n.data,
          hasSourceHandle: !!info?.hasSource,
          hasTargetHandle: !!info?.hasTarget,
        },
      });
    }
  }

  return nodes;
}

function toFlowEdges(connections: Connection[]): Edge[] {
  return connections.map((connection) => ({
    id: connection.id,
    source: connection.source,
    target: connection.target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: EDGE_COLOR,
    },
    style: {
      strokeWidth: 2,
      stroke: EDGE_COLOR,
      cursor: "pointer",
    },
  }));
}

function AgentVisualizerInner({ graph }: AgentVisualizerProps) {
  const frames = graph.frames;
  const connections = graph.connections;
  const frameList = Array.isArray(frames) ? frames : [frames];
  const [frameIndex, setFrameIndex] = useState(0);

  const clampedIndex =
    frameList.length === 0 ? 0 : Math.min(frameIndex, frameList.length - 1);
  const totalNodesUpToFrame = frameList
    .slice(0, clampedIndex + 1)
    .reduce((acc, f) => acc + f.nodes.length, 0);

  const connectionMap = buildConnectionMap(connections);

  const initialNodes = totalNodesUpToFrame
    ? toFlowNodesByFrame(frameList, clampedIndex, connectionMap)
    : [];
  const initialEdges = toFlowEdges(connections);

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

  const handleEdgeHover = useCallback(
    (edgeId: string, hover: boolean) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                style: {
                  ...e.style,
                  stroke: hover ? EDGE_HOVER_COLOR : EDGE_COLOR,
                  cursor: "pointer",
                },
                markerEnd: e.markerEnd
                  ? {
                      ...(e.markerEnd as any),
                      color: hover ? EDGE_HOVER_COLOR : EDGE_COLOR,
                    }
                  : undefined,
              }
            : e,
        ),
      );
    },
    [],
  );

  const onEdgeMouseEnter = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      handleEdgeHover(edge.id, true);
    },
    [handleEdgeHover],
  );

  const onEdgeMouseLeave = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      handleEdgeHover(edge.id, false);
    },
    [handleEdgeHover],
  );

  useEffect(() => {
    if (totalNodesUpToFrame === 0) return;
    const flowNodes = toFlowNodesByFrame(frameList, clampedIndex, connectionMap);
    setNodes(flowNodes);
    requestAnimationFrame(() => fitView());
  }, [clampedIndex, fitView, frames, connections]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodesDraggable={false}
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
