import { PixelDuckLoading } from "@/components/ui/pixel-duck-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="surface-panel relative overflow-hidden bg-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="accent-plate left-8 top-8 hidden h-16 w-16 -rotate-6 rounded-[24px] bg-accent-red lg:block" />
          <div className="accent-plate bottom-10 right-10 hidden h-14 w-28 rotate-3 rounded-full bg-accent-blue lg:block" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <Badge>Public Loading</Badge>
              <div className="space-y-4">
                <h1 className="font-display text-5xl uppercase leading-none tracking-tight text-ink sm:text-6xl">
                  Pixel Duck is escorting the next page in.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-ink/76 sm:text-lg">
                  Shared layout stays in place while the route stream finishes. The loading
                  state keeps the public side lively without falling back to a generic skeleton.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="cream">App Router</Badge>
                <Badge variant="blue">Streaming</Badge>
                <Badge variant="red">Pixel Duck</Badge>
              </div>
            </div>

            <PixelDuckLoading className="mx-auto w-full max-w-md bg-[linear-gradient(180deg,#fff8e8_0%,#ffffff_100%)]" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card accent="cream" className="space-y-4">
            <CardHeader>
              <Badge variant="cream">Instant State</Badge>
              <CardTitle>Route shell appears immediately.</CardTitle>
            </CardHeader>
            <CardDescription>
              This loader lives at `app/loading.tsx`, so public route transitions can show
              feedback before the full page payload finishes.
            </CardDescription>
          </Card>

          <Card accent="blue" className="space-y-4">
            <CardHeader>
              <Badge variant="blue">Asset Strategy</Badge>
              <CardTitle>Animation ships from `public/`.</CardTitle>
            </CardHeader>
            <CardDescription>
              The duck JSON is served from `/animations/pixel-duck.json` instead of being
              bundled into route code.
            </CardDescription>
          </Card>

          <Card accent="red" className="space-y-4">
            <CardHeader>
              <Badge variant="red">Motion Safety</Badge>
              <CardTitle>Reduced motion stays calm.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-ink/80">
                When the browser requests reduced motion, the duck stays on its opening frame
                instead of autoplaying.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
