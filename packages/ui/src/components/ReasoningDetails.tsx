import { Paper, Typography, Box, Divider, LinearProgress, Stack, Chip } from '@mui/material';
import { Edge } from '@xyflow/react';

export type ReasoningDetailsProps = {
    edge: Edge;
    position: { x: number; y: number };
};

export function ReasoningDetails({ edge, position }: ReasoningDetailsProps) {
    /**
     * edge.data = {
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
     **/
    const details = (edge.data as any)?.connection_details;

    if (!details) return null;

    const {
        target_tool_arg,
        source_tool_output_matched_text,
        confidence_score,
    } = details;
    const target_tool_arg_name = Object.keys(target_tool_arg)[0] || "unknown argument";
    const target_tool_arg_value = target_tool_arg[target_tool_arg_name] || "value";
    const sourceId = edge.source.substr(edge.source.length - 5);
    const targetId = edge.target.substr(edge.target.length - 5);

    const confidencePercent = Math.round(confidence_score * 100);

    let progressColor: "inherit" | "success" | "warning" | "error" = "inherit";
    let barColorHex = "#9ca3af";

    if (confidencePercent >= 40) {
        progressColor = "success";
        barColorHex = "#10b981";
    } else if (confidencePercent >= 20) {
        progressColor = "warning";
        barColorHex = "#f59e0b";
    } else {
        progressColor = "error";
        barColorHex = "#ef4444";
    }

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: 380,
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                p: 2.5,
                zIndex: 1000,
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                Tool Influence Detected
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                    Tool
                </Typography>

                <Chip
                    label={sourceId}
                    size="small"
                    variant="outlined"
                    sx={{
                        height: 22,
                        fontWeight: 500,
                        borderRadius: "6px",
                        borderColor: "#E0531F",
                        bgcolor: "white",
                    }}
                />

                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                    output influenced the AI to make a Tool
                </Typography>

                <Chip
                    label={targetId}
                    size="small"
                    variant="outlined"
                    sx={{
                        height: 22,
                        fontWeight: 500,
                        borderRadius: "6px",
                        borderColor: "#E0531F",
                        bgcolor: "white",
                    }}
                />

                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                    call, and the AI used it to fill the
                </Typography>

                <Chip
                    label={target_tool_arg_name}
                    size="small"
                    variant="outlined"
                    sx={{
                        height: 22,
                        fontWeight: 500,
                        borderRadius: "6px",
                        bgcolor: "#f3f4f6",
                        borderColor: "#E0531F",
                    }}
                />

                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                    argument.
                </Typography>
            </Stack>

            <Divider sx={{ mb: 2.5, borderColor: '#f3f4f6' }} />

            <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', mb: 1.5, display: 'block' }}>
                    INFLUENCE SUMMARY
                </Typography>

                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5, fontWeight: 500 }}>
                        Matched Text
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            p: 1.25,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '0.8125rem',
                            color: '#374151',
                            border: '1px solid #f3f4f6'
                        }}
                    >
                        {source_tool_output_matched_text}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5, fontWeight: 500 }}>
                        Used As Argument
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#111827' }}>
                            <Box component="span" sx={{ fontWeight: 600, color: '#374151' }}>{target_tool_arg_name}</Box> = "{String(target_tool_arg_value)}"
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: '#f3f4f6' }} />

            <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>
                        CONFIDENCE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: barColorHex }}>
                        {confidencePercent}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={confidencePercent}
                    color={progressColor}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#f3f4f6',
                    }}
                />
            </Box>
        </Paper>
    );
}

export default ReasoningDetails;