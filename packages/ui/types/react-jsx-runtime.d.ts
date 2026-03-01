declare module "react/jsx-runtime" {
  export function jsx(
    type: unknown,
    props: Record<string, unknown> | null,
    key?: string
  ): unknown;
  export function jsxs(
    type: unknown,
    props: Record<string, unknown> | null,
    key?: string
  ): unknown;
  export function Fragment(props: { children?: unknown }): unknown;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: unknown;
    }
  }
}

export {};
