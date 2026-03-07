import { Paper, Typography, Box, Divider, Stack, Chip, LinearProgress } from '@mui/material';
import { Edge } from '@xyflow/react';

export type ReasoningDetailsProps = {
    edge: Edge;
    position: { x: number; y: number };
};

export function ReasoningDetails({ edge, position }: ReasoningDetailsProps) {
    /**
     * edge.data = { target_tool_arg, matched_tokens } (flat)
     * OR { connection_details: { target_tool_arg, matched_tokens, score } } (nested)
     */
    const data = edge.data as Record<string, unknown> | undefined;
    const details = (data?.connection_details as Record<string, unknown>) ?? data;
    const target_tool_arg = (details?.target_tool_arg as Record<string, unknown>) ?? {};
    const matched_tokens = (details?.matched_tokens as string[]) ?? [];
    const score = (details?.score as number) ?? 0.0;

    if (!Object.keys(target_tool_arg).length && !matched_tokens.length) return null;

    const target_tool_arg_name = Object.keys(target_tool_arg)[0] || "unknown argument";
    const target_tool_arg_value = target_tool_arg[target_tool_arg_name] ?? "value";
    const sourceId = edge.source.slice(-5);
    const targetId = edge.target.slice(-5);

    const confidencePercent = Math.round((typeof score === "number" ? score : 0) * 100);
    const progressColor: "info" | "success" | "warning" | "error" =
        confidencePercent >= 40 ? "success" : confidencePercent >= 20 ? "info" : "error";
    const barColorHex =
        confidencePercent >= 40 ? "#10b981" : confidencePercent >= 20 ? "#3b82f6" : "#ef4444";

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
                        Matched Tokens
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
                        {matched_tokens.length ? (
                            matched_tokens.map((token, i) => (
                                <Chip
                                    key={i}
                                    label={token}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontWeight: 500,
                                        borderRadius: '6px',
                                        bgcolor: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fcd34d',
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>—</Typography>
                        )}
                    </Stack>
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

            <Box sx={{ mb: 0 }}>
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
                    value={Math.min(100, confidencePercent)}
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