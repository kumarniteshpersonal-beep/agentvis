import { Card, CardContent, Typography } from "@mui/material";

type MessageNodeProps = {
  type?: string;
  data?: {
    tool_args?: Record<string, unknown>;
  };
};

function MessageNode({ type, data }: MessageNodeProps) {
  const toolArgs = data?.tool_args;
  const hasArgs =
    toolArgs && typeof toolArgs === "object" && Object.keys(toolArgs).length > 0;

  return (
    <Card
      variant="outlined"
      sx={{ minWidth: 160, bgcolor: "#020617", borderColor: "#1f2937" }}
      className="nodrag"
    >
      <CardContent sx={{ p: 1.5 }}>
        {type && (
          <Typography
            variant="caption"
            sx={{ color: "#e5e7eb", fontWeight: 600, display: "block" }}
          >
            {type}
          </Typography>
        )}
        {hasArgs && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              whiteSpace: "pre-wrap",
              fontSize: 12,
              color: "#e5e7eb",
            }}
          >
            {Object.entries(toolArgs!)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join("\n")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default MessageNode;
