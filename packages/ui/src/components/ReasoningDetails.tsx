import { Edge } from "@xyflow/react";

type ReasoningDetailsProps = {
  edge: Edge;
  position: { x: number; y: number };
};

function ReasoningDetails({ edge, position }: ReasoningDetailsProps) {
    /*
    edge.data = {
        "connection_type": "ToolToTool",
        "connection_details": {
          "target_tool_arg": {
            "query": "weather in Mali"
          },
          "source_tool_output_matched_text": "weather in Mali",
          "source_tool_ouput_start_index": 1798,
          "source_tool_ouput_end_index": 1811,
          "confidence_score": 0.6335970163345337
        }
      }
    */
    return (
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          transform: "translateX(-50%)",
          background: "#020617",
          color: "#f9fafb",
          padding: "8px 12px",
          borderRadius: 10,
          fontSize: 12,
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.65)",
          pointerEvents: "none",
          zIndex: 1000,
          whiteSpace: "nowrap",
        }}
      >
        <div>Hello world</div>
        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
          {edge.data && JSON.stringify(edge.data)}
        </div>
      </div>
    );
}

export default ReasoningDetails;