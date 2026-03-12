import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
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
import ReasoningDetails from "./ReasoningDetails";
import ConnectionEdge from "./ConnectionEdge";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

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
  data: any
}

export interface AgentGraph {
  frames: Frame[];
  connections: Connection[];
}
export interface AgentVisualizerProps {
  graph: AgentGraph;
}

const DEFAULT_NODE_WIDTH = 340;
const DEFAULT_NODE_HEIGHT = 260;
const TOOL_NODE_HEIGHT = 400;
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
    let currentY = 0;

    for (let nodeIdx = 0; nodeIdx < frame.nodes.length; nodeIdx++) {
      const n = frame.nodes[nodeIdx];
      const hasSubagentUi =
        (n.data as any)?.subagent_ui &&
        Array.isArray((n.data as any)?.subagent_ui?.frames) &&
        (n.data as any)?.subagent_ui?.frames.length > 0;

      const baseHeight =
        (n.type as MessageType) === "ToolMessage" && hasSubagentUi
          ? TOOL_NODE_HEIGHT
          : DEFAULT_NODE_HEIGHT;
      const y = currentY;
      currentY += baseHeight + NODE_Y_GAP;

      const info = connectionMap[n.id];

      nodes.push({
        id: n.id,
        type: n.type,
        width: DEFAULT_NODE_WIDTH,
        height: baseHeight,
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
    data: connection.data,
    type: "connection",
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
  const initialFrameIndex =
    frameList.length === 0 ? 0 : Math.max(0, frameList.length - 1);
  const [frameIndex, setFrameIndex] = useState(initialFrameIndex);

  const clampedIndex =
    frameList.length === 0 ? 0 : Math.min(frameIndex, frameList.length - 1);
  const totalNodesUpToFrame = frameList
    .slice(0, clampedIndex + 1)
    .reduce((acc, f) => acc + f.nodes.length, 0);

  const connectionMap = useMemo(
    () => buildConnectionMap(connections),
    [connections],
  );

  const initialNodes = totalNodesUpToFrame
    ? toFlowNodesByFrame(frameList, clampedIndex, connectionMap)
    : [];
  const initialEdges = toFlowEdges(connections);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [hoveredTargetNodeId, setHoveredTargetNodeId] = useState<string | null>(null);
  const [popperPosition, setPopperPosition] = useState<{ x: number; y: number } | null>(null);
  const { fitView } = useReactFlow();

  const hasPrev = clampedIndex > 0;
  const hasNext = clampedIndex < frameList.length - 1;

  const onPrev = () => {
    setFrameIndex((idx) => Math.max(0, idx - 1));
  };

  const onNext = () => {
    if (frameList.length === 0) return;
    setFrameIndex((idx) => Math.min(frameList.length - 1, idx + 1));
  };

  const onEdgeMouseEnter = useCallback(
    (event: MouseEvent, edge: Edge) => {
      const target = event.currentTarget as HTMLElement | null;
      const rect = target?.getBoundingClientRect();

      if (rect) {
        setPopperPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        });
      } else {
        setPopperPosition(null);
      }

      setHoveredEdgeId(edge.id);
      setHoveredEdge(edge);
    },
    [],
  );

  const onEdgeClick = useCallback(
    (event: MouseEvent, edge: Edge) => {
      const target = event.currentTarget as HTMLElement | null;
      const rect = target?.getBoundingClientRect();

      if (rect) {
        setPopperPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        });
      } else {
        setPopperPosition(null);
      }

      setHoveredEdgeId(edge.id);
      setHoveredEdge(edge);
    },
    [],
  );

  const onEdgeMouseLeave = useCallback(
    (_: MouseEvent, _edge: Edge) => {
      setHoveredEdgeId(null);
      setHoveredEdge(null);
      setPopperPosition(null);
    },
    [],
  );

  const onNodeMouseEnter = useCallback(
    (_: MouseEvent, node: Node) => {
      setHoveredTargetNodeId(node.id);
    },
    [],
  );

  const onNodeMouseLeave = useCallback(
    (_: MouseEvent, _node: Node) => {
      setHoveredTargetNodeId(null);
    },
    [],
  );

  useEffect(() => {
    if (totalNodesUpToFrame === 0) return;

    const flowNodes = toFlowNodesByFrame(frameList, clampedIndex, connectionMap);
    setNodes(flowNodes);

    requestAnimationFrame(() => {
      fitView({
        padding: 0.2,
      });
    });
  }, [clampedIndex, frameList, connectionMap, totalNodesUpToFrame]);

  const visibleNodeIds = new Set(nodes.map((n) => n.id));

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges
          .filter(
            (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
          )
          .map((e) => {
            const isHovered =
              hoveredEdgeId === e.id ||
              (hoveredTargetNodeId !== null && e.target === hoveredTargetNodeId);
            const styledEdge: Edge = {
              ...e,
              style: {
                ...(e.style || {}),
                stroke: isHovered ? EDGE_HOVER_COLOR : EDGE_COLOR,
                cursor: "pointer",
              },
              markerEnd: e.markerEnd
                ? {
                    ...(e.markerEnd as any),
                    color: isHovered ? EDGE_HOVER_COLOR : EDGE_COLOR,
                  }
                : undefined,
            };

            return {
              ...styledEdge,
              data: {
                ...(styledEdge.data || {}),
                onButtonClick: (targetEl: HTMLElement) => {
                  const rect = targetEl.getBoundingClientRect();

                  setPopperPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 8,
                  });
                  setHoveredEdgeId(e.id);
                  setHoveredEdge(e);
                },
              },
            };
          })}
        onNodesChange={onNodesChange}
        onEdgesChange={() => {}}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onEdgeClick={onEdgeClick}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
        nodeTypes={{ HumanMessage: MessageNode, AIMessage: MessageNode, ToolMessage: MessageNode, SystemMessage: MessageNode }}
        edgeTypes={{ connection: ConnectionEdge }}
      >
        <Background />
        <Panel position="bottom-left">
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={hasPrev ? onPrev : undefined}
              disabled={!hasPrev}
              className="nodrag"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                border: "1px solid #b1b1b7",
                borderRadius: 4,
                background: "#fff",
                cursor: hasPrev ? "pointer" : "not-allowed",
                color: hasPrev ? "#e0531f" : "#cbd5e1",
                fontSize: 14,
                opacity: hasPrev ? 1 : 0.5,
              }}
            >
              <ArrowLeftIcon />
            </button>
            <button
              onClick={hasNext ? onNext : undefined}
              disabled={!hasNext}
              className="nodrag"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                border: "1px solid #b1b1b7",
                borderRadius: 4,
                background: "#fff",
                cursor: hasNext ? "pointer" : "not-allowed",
                color: hasNext ? "#e0531f" : "#cbd5e1",
                fontSize: 14,
                opacity: hasNext ? 1 : 0.5,
              }}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </Panel>
        <MiniMap />
        {hoveredEdge && popperPosition && (
          <ReasoningDetails edge={hoveredEdge} position={popperPosition} />
        )}
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
