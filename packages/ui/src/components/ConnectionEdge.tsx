import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import PolylineIcon from "@mui/icons-material/Polyline";

export default function ConnectionEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        {...props}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            zIndex: 1000,
          }}
          className="button-edge__label nodrag nopan"
        >
          <button
            type="button"
            onClick={(event) => {
              const target = event.currentTarget as HTMLElement | null;
              if (!target) return;

              // let the host component decide what to do
              (props.data as any)?.onButtonClick?.(target);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "999px",
              border: "1px solid #CBD5E1",
              color: "#e0531f",
              background: "#FFFFFF",
              cursor: "pointer",
              padding: 0,
            }}
            className="button-edge__button"
          >
            <PolylineIcon fontSize="small" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

