import { Card } from "@/components/ui/card";

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <Card className="bg-panel p-[1.2rem]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/70">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl uppercase leading-none text-ink">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-ink/75">{detail}</p>
    </Card>
  );
}
