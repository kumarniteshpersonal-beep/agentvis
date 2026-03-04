import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import PolylineIcon from "@mui/icons-material/Polyline";

type GetSpecialPathParams = {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  offset: number;
};

const getSpecialPath = (
  { sourceX, sourceY, targetX, targetY, offset }: GetSpecialPathParams,
) => {
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2 + offset;

  return `M ${sourceX} ${sourceY} Q ${centerX} ${centerY} ${targetX} ${targetY}`;
};

export default function ConnectionEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    style,
  } = props;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy);

  const curvatureFactor =
    (props.data as any)?.curvatureFactor === undefined
      ? 1
      : Number((props.data as any)?.curvatureFactor) || 1;

  const baseOffset = distance * 0.25 * curvatureFactor;
  const clampedOffset = Math.max(40, Math.min(200, baseOffset));
  const offset = clampedOffset;

  const edgePathParams: GetSpecialPathParams = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset,
  };

  const edgePath = getSpecialPath(edgePathParams);
  const labelT = 0.5;
  const p0x = sourceX;
  const p0y = sourceY;
  const p2x = targetX;
  const p2y = targetY;
  const p1x = (sourceX + targetX) / 2;
  const p1y = (sourceY + targetY) / 2 + offset;

  const oneMinusT = 1 - labelT;
  const labelX =
    oneMinusT * oneMinusT * p0x +
    2 * oneMinusT * labelT * p1x +
    labelT * labelT * p2x;
  const labelY =
    oneMinusT * oneMinusT * p0y +
    2 * oneMinusT * labelT * p1y +
    labelT * labelT * p2y;

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

