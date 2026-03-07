import { createRoot } from "react-dom/client";
import { useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { AgentVisualizer, type AgentGraph } from "../index";
import * as pako from "pako";

const BRAND = "#E0531F";

const root = document.getElementById("root");

function encodeGraphToViewParam(graph: AgentGraph): string {
  const jsonStr = JSON.stringify(graph);
  const compressed = pako.deflate(jsonStr);
  const binary = Array.from(compressed)
    .map((c) => String.fromCharCode(c))
    .join("");
  const base64 = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

function getRawViewParam(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("view");
}

function setViewParamInUrl(viewParam: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("view", viewParam);
  const next = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", next);
}

function parseAndValidateGraph(
  text: string,
): { ok: true; graph: AgentGraph } | { ok: false; error: string } {
  const trimmed = text.trim();
  const unwrapped =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("\"") && trimmed.endsWith("\""))
      ? trimmed.slice(1, -1)
      : trimmed;

  const validateGraph = (
    parsed: unknown,
  ): { ok: true; graph: AgentGraph } | { ok: false; error: string } => {
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Root must be an object." };
    }
    const obj = parsed as Record<string, unknown>;
    if (!Array.isArray(obj.frames)) {
      return { ok: false, error: "Missing or invalid 'frames' array." };
    }
    if (!Array.isArray(obj.connections)) {
      return { ok: false, error: "Missing or invalid 'connections' array." };
    }
    return { ok: true, graph: parsed as AgentGraph };
  };

  const candidates: string[] = [];
  const pushUnique = (s: string) => {
    if (s !== "" && !candidates.includes(s)) candidates.push(s);
  };

  pushUnique(unwrapped);
  // Common paste: JS/Python string literal escaping (extra backslashes)
  if (unwrapped.includes("\\\\")) pushUnique(unwrapped.replace(/\\\\/g, "\\"));
  // Common paste: JS-only escape for apostrophe in JSON-ish payloads
  if (unwrapped.includes("\\'")) pushUnique(unwrapped.replace(/\\'/g, "'"));
  // Combine both fixes (double-escaped + apostrophe)
  if (unwrapped.includes("\\\\") && unwrapped.includes("\\'")) {
    pushUnique(unwrapped.replace(/\\\\/g, "\\").replace(/\\'/g, "'"));
  }

  let lastErr: unknown = undefined;
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c) as unknown;
      const validated = validateGraph(parsed);
      if (validated.ok) return validated;

      // If it parses but is actually a JSON string (double-encoded), parse one more time.
      if (typeof parsed === "string") {
        try {
          const parsed2 = JSON.parse(parsed) as unknown;
          const validated2 = validateGraph(parsed2);
          if (validated2.ok) return validated2;
        } catch {
          // ignore
        }
      }

      lastErr = validated.error;
    } catch (e) {
      lastErr = e;
    }
  }

  const message =
    lastErr instanceof Error
      ? lastErr.message
      : typeof lastErr === "string"
        ? lastErr
        : "Invalid JSON";

  const tips: string[] = [];
  if (unwrapped.includes("\\'")) {
    tips.push("remove \\' escapes like in drug\\'s → drug's");
  }
  if (unwrapped.includes("\\\\")) {
    tips.push("this looks double-escaped; try removing extra backslashes (\\\\)");
  }

  return {
    ok: false,
    error: `JSON Parse error: ${message}${tips.length ? ` (Tip: ${tips.join("; ")})` : ""}`,
  };
}

function decodeViewParamToJsonText(
  viewParam: string,
):
  | { ok: true; jsonText: string }
  | { ok: false; error: string; jsonText?: string } {
  try {
    const cleaned = viewParam.trim().replace(/^['"]|['"]$/g, "");
    // Some folks paste a whole URL into the `view` param by mistake: extract the real token.
    const extracted =
      cleaned.includes("view=")
        ? cleaned.match(/(?:^|[?&])view=([^&]+)/)?.[1] ?? cleaned
        : cleaned;

    // URLSearchParams decodes `+` to space; normalize it back.
    const normalized = extracted.replace(/ /g, "+");

    const base64 = normalized
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "=",
      );

    const binaryString = atob(base64);
    const compressed = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    const decompressed = pako.inflate(compressed, { to: "string" });
    return { ok: true, jsonText: decompressed };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid view param";
    return { ok: false, error: `Invalid 'view' param: ${message}` };
  }
}

type EditorProps = {
  raw: string;
  setRaw: (v: string) => void;
  error: string | null;
  setError: (v: string | null) => void;
  onViewGraph: (g: AgentGraph) => void;
};

function GraphJsonEditor({ raw, setRaw, error, setError, onViewGraph }: EditorProps) {
  const handleFormat = useCallback(() => {
    const result = parseAndValidateGraph(raw);
    if (result.ok) {
      setRaw(JSON.stringify(result.graph, null, 2));
      setError(null);
    } else {
      setError(result.error);
    }
  }, [raw, setRaw, setError]);

  const handleView = useCallback(() => {
    const result = parseAndValidateGraph(raw);
    if (result.ok) {
      setError(null);
      onViewGraph(result.graph);
    } else {
      setError(result.error);
    }
  }, [raw, setError, onViewGraph]);

  return (
    <>
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="img"
            src="/agentvis_logo.svg"
            alt="AgentVis logo"
            sx={{ width: 80, height: 80, display: "block" }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            agentvis
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Paste your agent graph JSON below, then format or view.
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <TextField
          multiline
          minRows={14}
          maxRows={24}
          fullWidth
          placeholder='{"frames": [...], "connections": [...]}'
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            if (error) setError(null);
          }}
          error={!!error}
          helperText={error ?? undefined}
          FormHelperTextProps={{
            sx: { color: "#dc2626", mt: 0.5 },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily:
                "ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              bgcolor: error ? "#fef2f2" : "#f8fafc",
              borderColor: error ? "#dc2626" : "#e2e8f0",
              "& fieldset": {
                borderWidth: 1,
                borderColor: error ? "#dc2626" : "#e2e8f0",
              },
              "&:hover fieldset": {
                borderColor: error ? "#dc2626" : "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: error ? "#dc2626" : BRAND,
              },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleFormat}
          sx={{
            borderColor: "#cbd5e1",
            color: "#475569",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#94a3b8",
              bgcolor: "#f1f5f9",
            },
          }}
        >
          Format JSON
        </Button>
        <Button
          variant="contained"
          onClick={handleView}
          sx={{
            bgcolor: BRAND,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            "&:hover": {
              bgcolor: "#c7441a",
            },
          }}
        >
          View
        </Button>
      </Box>
    </>
  );
}

function EditorCard(props: EditorProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 820,
        bgcolor: "#ffffff",
        borderRadius: 2,
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <GraphJsonEditor {...props} />
    </Box>
  );
}

function App() {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [graph, setGraph] = useState<AgentGraph | null>(null);
  const [graphOnly, setGraphOnly] = useState(false);
  const [viewClicked, setViewClicked] = useState(false);

  const onViewGraph = useCallback((g: AgentGraph) => {
    setGraph(g);
    setRaw(JSON.stringify(g, null, 2));
    const viewParam = encodeGraphToViewParam(g);
    setViewParamInUrl(viewParam);
    setGraphOnly(true);
    setViewClicked(true);
  }, []);

  useEffect(() => {
    const view = getRawViewParam();
    if (!view) return;

    const decoded = decodeViewParamToJsonText(view);
    if (!decoded.ok) {
      setGraph(null);
      setGraphOnly(false);
      setError(decoded.error);
      setRaw(decoded.jsonText ?? "");
      return;
    }

    // Fill editor with what we decoded, even if validation fails
    setRaw(decoded.jsonText);
    const parsed = parseAndValidateGraph(decoded.jsonText);
    if (parsed.ok) {
      setGraph(parsed.graph);
      setRaw(JSON.stringify(parsed.graph, null, 2));
      setError(null);
    } else {
      setGraph(null);
      setGraphOnly(false);
      setError(parsed.error);
    }
  }, []);

  if (graphOnly && graph) {
    return <AgentVisualizer graph={graph} />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <EditorCard
          raw={raw}
          setRaw={setRaw}
          error={error}
          setError={setError}
          onViewGraph={onViewGraph}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {viewClicked && graph ? (
          <AgentVisualizer graph={graph} />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Paste JSON and click “View” to render the graph.
          </Box>
        )}
      </Box>
    </Box>
  );
}

if (root) {
  createRoot(root).render(<App />);
}
