import { Card, CardContent, Typography, Chip, Box, Stack } from "@mui/material";

type MessageNodeProps = {
  id?: string;
  type?: string;
  data?: {
    content?: string;
    tool_name?: string;
    tool_args?: Record<string, unknown>;
  };
};

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

const TYPE_CONFIG: Record<
  string,
  {
    icon: string;
    color: ChipColor;
  }
> = {
  ToolMessage: { icon: "🛠", color: "success" },
  AIMessage: { icon: "🤖", color: "info" },
  HumanMessage: { icon: "👤", color: "secondary" },
  SystemMessage: { icon: "⚙️", color: "warning" },
};

function MessageNode({ id, type, data }: MessageNodeProps) {
  const messageType = type ?? (data as any)?.messageType ?? "Message";
  const config = TYPE_CONFIG[messageType] ?? { icon: "", color: "default" as ChipColor };

  const content = data?.content;
  const toolName = data?.tool_name;
  const toolArgs = data?.tool_args;
  const hasArgs =
    toolArgs && typeof toolArgs === "object" && Object.keys(toolArgs).length > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 200,
        bgcolor: "#ffffff",
        borderColor: "#e5e7eb",
        cursor: "pointer",
      }}
      className="nodrag"
    >
      <CardContent sx={{ p: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Chip
            size="small"
            label={`${config.icon} ${messageType}`}
            color={config.color}
            variant="filled"
            sx={{
              height: 22,
              borderRadius: "999px",
              fontSize: 10,
              px: 0.75,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          />
          {id && (
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: 10 }}>
              ID: {id.slice(0, 3)}
            </Typography>
          )}
        </Stack>
        {toolName && (
          <Box mt={1.25}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: "#64748b",
                display: "block",
              }}
            >
              FUNCTION
            </Typography>
            <Box
              sx={{
                mt: 0.25,
                borderRadius: 1,
                bgcolor: "#f1f5f9",
                px: 1,
                py: 0.75,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}
              >
                {toolName}
              </Typography>
            </Box>
          </Box>
        )}

        {hasArgs && (
          <Box mt={toolName ? 1.5 : 1}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: "#64748b",
                display: "block",
              }}
            >
              PARAMETERS
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                borderRadius: 1,
                bgcolor: "#f8fafc",
                px: 1,
                py: 0.5,
              }}
            >
              {Object.entries(toolArgs!).map(([k, v]) => (
                <Stack
                  key={k}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ fontSize: 12, color: "#0f172a" }}
                >
                  <Typography sx={{ color: "#16a34a", fontSize: 12 }}>{k}</Typography>
                  <Typography sx={{ fontSize: 12 }}>{String(v)}</Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        )}

        {content !== undefined && (
          <Box mt={hasArgs || toolName ? 1.5 : 1.25}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: "#64748b",
                display: "block",
              }}
            >
              CONTENT
            </Typography>
            <Box
              sx={{
                mt: 0.25,
                borderRadius: 1,
                bgcolor: "#f8fafc",
                px: 1,
                py: 0.75,
                maxHeight: 120,
                overflowY: "auto",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  color:
                    typeof content === "string" && content.trim() === ""
                      ? "#94a3b8"
                      : "#0f172a",
                  fontStyle:
                    typeof content === "string" && content.trim() === ""
                      ? "italic"
                      : "normal",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {typeof content === "string" && content.trim() === "" ? "empty" : content}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default MessageNode;