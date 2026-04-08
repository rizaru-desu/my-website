declare module "rough-viz" {
  type RoughVizInstance = {
    remove?: () => void;
  };

  export type RoughVizConstructor = new (
    options: Record<string, unknown>,
  ) => RoughVizInstance;

  export const Bar: RoughVizConstructor;
  export const BarH: RoughVizConstructor;
  export const Donut: RoughVizConstructor;
  export const Line: RoughVizConstructor;

  const roughViz: {
    Bar: RoughVizConstructor;
    BarH: RoughVizConstructor;
    Donut: RoughVizConstructor;
    Line: RoughVizConstructor;
  };

  export default roughViz;
}
