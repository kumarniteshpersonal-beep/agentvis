import { createRoot } from "react-dom/client";
import { AgentVisualizer, type AgentGraph } from "../index";
import * as pako from "pako";

const root = document.getElementById("root");

const fallbackGraph: AgentGraph = {
  frames: [
  {
    nodes: [
      {
        id: "0cd0edf2-bba9-4d33-b459-c3f2dc29cea5",
        type: "HumanMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "lc_run--019ca93b-bea4-71f0-af32-edb16bde57da-0",
        type: "AIMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "4aab5550-2e2c-45e4-9939-ff64553abaec",
        type: "ToolMessage",
        data: {
          tool_name: "multiply",
          tool_args: {
            a: 2,
            b: 3,
          },
        },
      },
    ],
  },
  {
    nodes: [
      {
        id: "lc_run--019ca93b-c3c0-7122-be76-3e00712f8b92-0",
        type: "AIMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "d4483108-4189-45f2-8ca8-2ad0c5d0ad8b",
        type: "ToolMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "lc_run--019ca93b-c6fa-7163-aa7f-fcca83a95469-0",
        type: "AIMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "04878524-b55d-4435-97fa-2d570ee147ec",
        type: "ToolMessage",
      },
    ],
  },
  {
    nodes: [
      {
        id: "lc_run--019ca93b-c9dc-77b2-993e-51f6945f30e1-0",
        type: "AIMessage",
      },
    ],
  },
],
  connections: [
    {
      id: "d4483108-4189-45f2-8ca8-2ad0c5d0ad8b--04878524-b55d-4435-97fa-2d570ee147ec",
      source: "d4483108-4189-45f2-8ca8-2ad0c5d0ad8b",
      target: "04878524-b55d-4435-97fa-2d570ee147ec",
    }
  ],
};

function getParsedJsonFromQuery(): AgentGraph | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("view");
    if (!raw) return undefined;

    const base64 = raw
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(raw.length + (4 - (raw.length % 4)) % 4, "=");

    const binaryString = atob(base64);
    const compressed = Uint8Array.from(binaryString, (c) =>
      c.charCodeAt(0)
    );

    const decompressed = pako.inflate(compressed, { to: "string" });

    return JSON.parse(decompressed) as AgentGraph;
  } catch (error) {
    console.error("Error parsing compressed JSON", error);
    return undefined;
  }
}

const parsedJson = getParsedJsonFromQuery() ?? fallbackGraph;

if (root) {
  createRoot(root).render(<AgentVisualizer graph={parsedJson} />);
}