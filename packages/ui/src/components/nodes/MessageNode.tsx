import { Card, CardContent, Typography, Chip, Box, Stack, SvgIconTypeMap, SvgIconPropsColorOverrides, Drawer, IconButton, Button, Dialog, DialogContent } from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ConstructionIcon from '@mui/icons-material/Construction';
import Face6Icon from '@mui/icons-material/Face6';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import ImageIcon from '@mui/icons-material/Image';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { OverridableStringUnion } from "@mui/types";
import { ChipPropsColorOverrides } from "@mui/material/Chip";
import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { JsonView, allExpanded } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { AgentGraph, AgentVisualizer } from "../AgentVisualizer";

type MessageNodeProps = {
  id?: string;
  type?: string;
  data?: {
    content?: unknown;
    tool_name?: string;
    tool_args?: Record<string, unknown>;
    subagent_ui?: AgentGraph;
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

const CONTENT_TYPE_COLORS: Record<
  string,
  {
    bg: string;
    fg: string;
  }
> = {
  text: { bg: "#ffffff", fg: "#0f172a" },
  reasoning: { bg: "#ffffff", fg: "#0f172a" },
  image: { bg: "#ffffff", fg: "#0f172a" },
};

function MessageNode({ id, type, data }: MessageNodeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subagentDialogOpen, setSubagentDialogOpen] = useState(false);

  const messageType = type ?? (data as any)?.messageType ?? "Message";
  const config = TYPE_CONFIG[messageType] ?? { icon: "", color: "default" as ChipColor };

  const content = data?.content;
  const toolName = data?.tool_name;
  const toolArgs = data?.tool_args;
  const subagentGraph = data?.subagent_ui;
  const hasArgs =
    toolArgs && typeof toolArgs === "object" && Object.keys(toolArgs).length > 0;
  const hasSubagentUi =
    !!subagentGraph &&
    Array.isArray((subagentGraph as AgentGraph).frames) &&
    (subagentGraph as AgentGraph).frames.length > 0;

  const hasSourceHandle = Boolean((data as any)?.hasSourceHandle);
  const hasTargetHandle = Boolean((data as any)?.hasTargetHandle);
  const isHighlighted = Boolean((data as any)?.isHighlighted);

  const contentBlocks =
    Array.isArray(content) && content.length > 0
      ? content.map((item: any) => {
          if (typeof item === "string") {
            return { type: "text", text: item };
          }
          if (item && typeof item === "object") {
            return item as any;
          }
          return { type: "text", text: String(item) };
        })
      : null;

  const renderContent = (compact: boolean) => (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        {config.icon && <config.icon color={config.iconColor} />}
        <Stack direction="row" spacing={0.5} alignItems="center">
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
          {messageType === "ToolMessage" && hasSubagentUi && (
            <Chip
              size="small"
              label="Subagent"
              color="default"
              icon={<AccountTreeIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 22,
                borderRadius: "999px",
                fontSize: 10,
                px: 0.75,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                bgcolor: "#E0531F",
                color: "#ffffff",
                "& .MuiChip-icon": {
                  color: "#ffffff",
                  ml: 0,
                },
              }}
            />
          )}
        </Stack>
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
              bgcolor: "#ffffff",
              px: compact ? 1 : 1.5,
              py: compact ? 0.75 : 1.25,
              ...(compact
                ? {
                    maxHeight:
                      Array.isArray(contentBlocks) && contentBlocks.length > 0
                        ? 220
                        : 120,
                    overflowY: "auto",
                  }
                : {}),
            }}
          >
            {Array.isArray(contentBlocks) && contentBlocks.length > 0 ? (
              <Stack spacing={compact ? 0.75 : 1.25}>
                {contentBlocks.map((block: any, idx: number) => {
                  const typeKey = String(block.type || "text").toLowerCase();
                  const palette =
                    CONTENT_TYPE_COLORS[typeKey] ?? CONTENT_TYPE_COLORS["text"];

                  const textValue =
                    block.text ??
                    block.content ??
                    block.value ??
                    (typeof block === "string"
                      ? block
                      : JSON.stringify(block, null, 2));

                  const isEmptyText =
                    typeof textValue === "string" &&
                    textValue.trim().length === 0;

                  const TypeIcon =
                    typeKey === "image"
                      ? ImageIcon
                      : typeKey === "reasoning"
                      ? PsychologyIcon
                      : MessageIcon;

                  return (
                    <Box
                      key={idx}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: palette.bg,
                        border: "1px solid rgba(148,163,184,0.45)",
                        px: compact ? 1 : 1.25,
                        py: compact ? 0.75 : 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        mb={compact ? 0.25 : 0.5}
                      >
                        <TypeIcon
                          sx={{
                            fontSize: 14,
                            color: "#475569",
                          }}
                        />
                        <Typography
                          variant="overline"
                          sx={{
                            fontSize: 9,
                            letterSpacing: 1.4,
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          {typeKey === "image"
                            ? "Attachment"
                            : typeKey === "reasoning"
                            ? "Reasoning"
                            : "Message"}
                        </Typography>
                      </Stack>

                      {typeKey === "image" && block.url ? (
                        <Box
                          sx={{
                            mt: compact ? 0.25 : 0.5,
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            bgcolor: "#f9fafb",
                          }}
                        >
                          <img
                            src={block.url}
                            alt={`content block ${idx + 1}`}
                            style={{
                              display: "block",
                              width: "100%",
                              maxHeight: compact ? 160 : 260,
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      ) : typeKey === "reasoning" ? (
                        !compact && (block.reasoning || "").trim() ? (
                          <Box
                            sx={{
                              "& *": {
                                fontFamily: "'Raleway', sans-serif",
                              },
                              "& p": {
                                margin: "0 0 4px",
                                fontSize: 13,
                                color: "#0f172a",
                              },
                              "& h1, & h2, & h3, & h4": {
                                margin: "4px 0",
                                fontWeight: 600,
                                fontSize: 14,
                              },
                              "& ul, & ol": {
                                paddingLeft: "1.1rem",
                                margin: "4px 0",
                              },
                              "& code": {
                                fontFamily:
                                  "SF Mono, ui-monospace, Menlo, Monaco, Consolas, monospace",
                                fontSize: 12,
                                backgroundColor: "#f3f4f6",
                                borderRadius: 4,
                                padding: "1px 4px",
                              },
                            }}
                          >
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {block.reasoning || "–"}
                            </ReactMarkdown>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily:
                                "SF Mono, ui-monospace, Menlo, Monaco, monospace",
                              fontSize: compact ? 11 : 12,
                              color: "#0f172a",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {block.reasoning || "–"}
                          </Typography>
                        )
                      ) : !compact && typeof textValue === "string" && !isEmptyText ? (
                        <Box
                          sx={{
                            "& *": {
                              fontFamily: "'Raleway', sans-serif",
                            },
                            "& p": {
                              margin: "0 0 4px",
                              fontSize: 13,
                              color: "#0f172a",
                            },
                            "& h1, & h2, & h3, & h4": {
                              margin: "4px 0",
                              fontWeight: 600,
                              fontSize: 14,
                            },
                            "& ul, & ol": {
                              paddingLeft: "1.1rem",
                              margin: "4px 0",
                            },
                            "& code": {
                              fontFamily:
                                "SF Mono, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                              fontSize: 12,
                              backgroundColor: "#f3f4f6",
                              borderRadius: 4,
                              padding: "1px 4px",
                            },
                          }}
                        >
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{textValue}</ReactMarkdown>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: compact ? 12 : 13,
                            color: isEmptyText ? "#64748b" : "#0f172a",
                            fontStyle: isEmptyText ? "italic" : "normal",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {isEmptyText ? "empty" : textValue}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            ) : (() => {
              const isString = typeof content === "string";
              const trimmed = isString ? content.trim() : "";
              const isEmpty = isString && trimmed === "";

              // Drawer-only enhanced rendering for string content
              if (!compact && isString && !isEmpty) {
                let parsed: unknown = null;
                let isJsonObject = false;

                try {
                  parsed = JSON.parse(trimmed);
                  isJsonObject =
                    parsed !== null &&
                    (Array.isArray(parsed) || typeof parsed === "object");
                } catch {
                  isJsonObject = false;
                }

                if (isJsonObject) {
                  return (
                    <Box
                      sx={{
                        borderRadius: 1,
                        border: "1px solid rgba(148,163,184,0.5)",
                        bgcolor: "#f9fafb",
                        width: "100%",
                        height: "100%",
                        overflow: "auto",
                      }}
                    >
                      <JsonView data={parsed as any} shouldExpandNode={allExpanded} />
                    </Box>
                  );
                }

                return (
                  <Box
                    sx={{
                      "& *": {
                        fontFamily: "'Raleway', sans-serif",
                      },
                      "& p": { margin: "0 0 4px", fontSize: 13, color: "#0f172a" },
                      "& h1, & h2, & h3, & h4": {
                        margin: "4px 0",
                        fontWeight: 600,
                        fontSize: 14,
                      },
                      "& ul, & ol": {
                        paddingLeft: "1.1rem",
                        margin: "4px 0",
                      },
                      "& code": {
                        fontFamily:
                          "SF Mono, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontSize: 12,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 4,
                        padding: "1px 4px",
                      },
                    }}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content as string}</ReactMarkdown>
                  </Box>
                );
              }

              // Compact node view or non-string: keep original simple text UI
              return (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    color: isEmpty ? "#94a3b8" : "#0f172a",
                    fontStyle: isEmpty ? "italic" : "normal",
                    whiteSpace: "pre-wrap",
                    ...(compact
                      ? {
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }
                      : {}),
                  }}
                >
                  {isEmpty ? "empty" : (content as any)}
                </Typography>
              );
            })()}
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 220,
        width: 340,
        maxWidth: 340,
        minHeight:
          messageType === "ToolMessage" && hasSubagentUi ? 400 : "auto",
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
      {messageType === "ToolMessage" && hasSubagentUi && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Button
            fullWidth
            size="small"
            variant="contained"
            endIcon={<ArrowOutwardIcon sx={{ fontSize: 16, ml: "auto" }} />}
            onClick={(event) => {
              event.stopPropagation();
              setSubagentDialogOpen(true);
            }}
            sx={{
              mt: 0.5,
              borderRadius: 0,
              textTransform: "none",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.4,
              py: 0.5,
              px: 1.5,
              bgcolor: "#E0531F",
              "&:hover": {
                bgcolor: "#c64318",
              },
            }}
          >
            View Reasoning Graph
          </Button>
        </Box>
      )}
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
        ModalProps={{
          sx: {
            zIndex: (theme) => theme.zIndex.modal + 2,
          },
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
      {hasSubagentUi && subagentGraph && (
        <Dialog
          open={subagentDialogOpen}
          onClose={(event) => {
            if (event && "stopPropagation" in event && typeof (event as any).stopPropagation === "function") {
              (event as any).stopPropagation();
            }
            setSubagentDialogOpen(false);
          }}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "#ffffff",
              borderRadius: 3,
              overflow: "hidden",
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              height: "80vh",
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 10,
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#0f172a",
                    "&:hover": {
                      bgcolor: "#f1f5f9",
                    },
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSubagentDialogOpen(false);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ width: "100%", height: "100%" }}>
                <AgentVisualizer graph={subagentGraph as AgentGraph} />
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

export default MessageNode;