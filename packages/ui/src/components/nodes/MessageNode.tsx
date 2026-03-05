import { Card, CardContent, Typography, Chip, Box, Stack, SvgIconTypeMap, SvgIconPropsColorOverrides, Drawer, IconButton } from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ConstructionIcon from '@mui/icons-material/Construction';
import Face6Icon from '@mui/icons-material/Face6';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { OverridableStringUnion } from "@mui/types";
import { ChipPropsColorOverrides } from "@mui/material/Chip";
import { Handle, Position } from "@xyflow/react";
import { useState } from "react";

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
    icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
    color: ChipColor | OverridableStringUnion<"primary" | "secondary" | "error" | "info" | "success" | "warning", ChipPropsColorOverrides>;
    iconColor: OverridableStringUnion<"primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit" | "disabled" | "action", SvgIconPropsColorOverrides>;
  }
> = {
  ToolMessage: { icon: ConstructionIcon, color: "success", iconColor: "success" },
  AIMessage: { icon: SmartToyIcon, color: "info", iconColor: "info" },
  HumanMessage: { icon: Face6Icon, color: "secondary", iconColor: "secondary" },
  SystemMessage: { icon: SettingsIcon, color: "warning", iconColor: "warning" },
};

function MessageNode({ id, type, data }: MessageNodeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const messageType = type ?? (data as any)?.messageType ?? "Message";
  const config = TYPE_CONFIG[messageType] ?? { icon: "", color: "default" as ChipColor };

  const content = data?.content;
  const toolName = data?.tool_name;
  const toolArgs = data?.tool_args;
  const hasArgs =
    toolArgs && typeof toolArgs === "object" && Object.keys(toolArgs).length > 0;

  const hasSourceHandle = Boolean((data as any)?.hasSourceHandle);
  const hasTargetHandle = Boolean((data as any)?.hasTargetHandle);
  const isHighlighted = Boolean((data as any)?.isHighlighted);

  const renderContent = (compact: boolean) => (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        {config.icon && <config.icon color={config.iconColor} />}
        <Chip
          size="small"
          label={messageType}
          color={config.color}
          variant="outlined"
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
            ID: {id.substr(id.length - 5)}
          </Typography>
        )}
      </Stack>
      {toolName && (
        <Box mt={compact ? 1.25 : 2}>
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
              px: compact ? 1 : 1.5,
              py: compact ? 0.75 : 1.25,
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
        <Box mt={toolName ? (compact ? 1.5 : 2) : 1}>
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
              px: compact ? 1 : 1.5,
              py: compact ? 0.5 : 1,
            }}
          >
            {Object.entries(toolArgs!).map(([k, v]) => {
              const displayValue =
                typeof v === "string" ? v : JSON.stringify(v, null, compact ? 0 : 2);

              return (
                <Stack
                  key={k}
                  direction="row"
                  alignItems="flex-start"
                  sx={{
                    fontSize: 12,
                    color: "#0f172a",
                    mb: compact ? 0.25 : 0.5,
                    width: "100%",
                    justifyContent: "space-between",
                    columnGap: 0.75,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#16a34a",
                      fontSize: 12,
                      maxWidth: "35%",
                      flexShrink: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={k}
                  >
                    {k}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      maxWidth: "60%",
                      flexGrow: 1,
                      textAlign: "right",
                      whiteSpace: compact ? "nowrap" : "normal",
                      overflow: compact ? "hidden" : "visible",
                      textOverflow: compact ? "ellipsis" : "unset",
                      wordBreak: compact ? "normal" : "break-word",
                    }}
                    title={displayValue}
                  >
                    {displayValue}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Box>
      )}

      {content !== undefined && (
        <Box mt={hasArgs || toolName ? (compact ? 1.5 : 2) : 1.25}>
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
              mt: compact ? 0.25 : 0.75,
              borderRadius: 1,
              bgcolor: "#f8fafc",
              px: compact ? 1 : 1.5,
              py: compact ? 0.75 : 1.25,
              ...(compact
                ? {
                    maxHeight: 120,
                    overflowY: "auto",
                  }
                : {}),
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
                ...(compact
                  ? {
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }
                  : {}),
              }}
            >
              {typeof content === "string" && content.trim() === "" ? "empty" : content}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 200,
        width: 320,
        maxWidth: 320,
        bgcolor: "#ffffff",
        borderColor: isHighlighted ? "#E0531F" : "#e5e7eb",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
        boxShadow: isHighlighted
          ? "0 0 0 1px rgba(224, 83, 31, 0.35), 0 18px 45px rgba(15, 23, 42, 0.35)"
          : "0 6px 18px rgba(15, 23, 42, 0.06)",
        transition:
          "box-shadow 150ms ease, border-color 150ms ease, transform 150ms ease",
        "&:hover": {
          borderColor: "#E0531F",
          boxShadow:
            "0 0 0 1px rgba(224, 83, 31, 0.45), 0 22px 55px rgba(15, 23, 42, 0.4)",
          transform: "translateY(-2px)",
        },
      }}
      className="nodrag"
      onClick={() => setDrawerOpen(true)}
    >
      <CardContent sx={{ p: 1.5 }}>
        {renderContent(true)}
      </CardContent>
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "50%", transform: "translateY(-50%)", left: -8 }}
        />
      )}
      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ top: "50%", transform: "translateY(-50%)", right: -8 }}
        />
      )}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={(event) => {
          (event as React.MouseEvent<HTMLDivElement>).stopPropagation();
          setDrawerOpen(false);
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: "80vw",
            p: 2,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Message details
            </Typography>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setDrawerOpen(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {renderContent(false)}
          </Box>
        </Box>
      </Drawer>
    </Card>
  );
}

export default MessageNode;