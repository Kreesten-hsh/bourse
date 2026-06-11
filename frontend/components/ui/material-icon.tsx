import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MaterialIconProps = Readonly<{
  name: string;
  className?: string;
  size?: number;
}>;

type IconShape =
  | Readonly<{ type: "path"; d: string }>
  | Readonly<{ type: "circle"; cx: number; cy: number; r: number }>
  | Readonly<{ type: "line"; x1: number; y1: number; x2: number; y2: number }>
  | Readonly<{ type: "rect"; x: number; y: number; width: number; height: number; rx?: number }>
  | Readonly<{ type: "polyline"; points: string }>;

type IconDefinition = Readonly<{
  viewBox?: string;
  shapes: ReadonlyArray<IconShape>;
}>;

const baseIcons = {
  arrowRight: [{ type: "path", d: "M40 128h176M144 56l72 72-72 72" }],
  bank: [{ type: "path", d: "M28 96l100-56 100 56M52 104h152M68 104v80M108 104v80M148 104v80M188 104v80M44 184h168M28 216h200" }],
  bookmark: [{ type: "path", d: "M72 40h112a8 8 0 0 1 8 8v168l-64-40-64 40V48a8 8 0 0 1 8-8Z" }],
  briefcase: [{ type: "rect", x: 36, y: 72, width: 184, height: 136, rx: 14 }, { type: "path", d: "M92 72V52h72v20M36 116h184M112 116v18h32v-18" }],
  calendar: [{ type: "rect", x: 40, y: 52, width: 176, height: 160, rx: 14 }, { type: "line", x1: 40, y1: 92, x2: 216, y2: 92 }, { type: "line", x1: 88, y1: 32, x2: 88, y2: 64 }, { type: "line", x1: 168, y1: 32, x2: 168, y2: 64 }],
  caretDown: [{ type: "polyline", points: "72 104 128 160 184 104" }],
  check: [{ type: "path", d: "M48 132l48 48L208 68" }],
  circle: [{ type: "circle", cx: 128, cy: 128, r: 76 }],
  close: [{ type: "line", x1: 72, y1: 72, x2: 184, y2: 184 }, { type: "line", x1: 184, y1: 72, x2: 72, y2: 184 }],
  code: [{ type: "path", d: "M96 72l-56 56 56 56M160 72l56 56-56 56M140 48l-24 160" }],
  compass: [{ type: "circle", cx: 128, cy: 128, r: 88 }, { type: "path", d: "M164 92l-24 56-56 24 24-56 56-24Z" }],
  database: [{ type: "path", d: "M48 72c0-22 36-40 80-40s80 18 80 40-36 40-80 40-80-18-80-40Z" }, { type: "path", d: "M48 72v56c0 22 36 40 80 40s80-18 80-40V72" }, { type: "path", d: "M48 128v56c0 22 36 40 80 40s80-18 80-40v-56" }],
  file: [{ type: "path", d: "M72 32h76l44 44v148H72V32Z" }, { type: "path", d: "M148 32v44h44M96 124h64M96 160h64" }],
  filePlus: [{ type: "path", d: "M72 32h76l44 44v148H72V32Z" }, { type: "path", d: "M148 32v44h44M128 124v56M100 152h56" }],
  gift: [{ type: "rect", x: 40, y: 92, width: 176, height: 116, rx: 10 }, { type: "line", x1: 128, y1: 92, x2: 128, y2: 208 }, { type: "path", d: "M32 92h192v44H32V92ZM128 92c-30 0-52-12-52-32 0-16 14-28 30-24 14 4 22 20 22 56ZM128 92c30 0 52-12 52-32 0-16-14-28-30-24-14 4-22 20-22 56Z" }],
  globe: [{ type: "circle", cx: 128, cy: 128, r: 88 }, { type: "path", d: "M40 128h176M128 40c28 26 42 55 42 88s-14 62-42 88M128 40c-28 26-42 55-42 88s14 62 42 88" }],
  graduation: [{ type: "path", d: "M24 88l104-48 104 48-104 48L24 88Z" }, { type: "path", d: "M72 112v48c24 24 88 24 112 0v-48M208 98v62" }],
  id: [{ type: "rect", x: 36, y: 56, width: 184, height: 144, rx: 14 }, { type: "circle", cx: 92, cy: 116, r: 24 }, { type: "path", d: "M60 168c12-24 52-24 64 0M148 104h44M148 136h44M148 168h28" }],
  link: [{ type: "path", d: "M98 154l60-60M108 72l18-18a42 42 0 0 1 60 60l-18 18M148 184l-18 18a42 42 0 0 1-60-60l18-18" }],
  list: [{ type: "line", x1: 84, y1: 76, x2: 208, y2: 76 }, { type: "line", x1: 84, y1: 128, x2: 208, y2: 128 }, { type: "line", x1: 84, y1: 180, x2: 208, y2: 180 }, { type: "circle", cx: 48, cy: 76, r: 8 }, { type: "circle", cx: 48, cy: 128, r: 8 }, { type: "circle", cx: 48, cy: 180, r: 8 }],
  money: [{ type: "circle", cx: 128, cy: 128, r: 88 }, { type: "path", d: "M128 72v112M160 96c-10-14-48-18-58 2-16 32 62 24 48 62-10 26-54 20-66 2" }],
  note: [{ type: "path", d: "M64 44h96l32 32v136H64V44Z" }, { type: "path", d: "M160 44v32h32M92 136h72M92 168h52" }],
  paperPlane: [{ type: "path", d: "M28 128l196-88-56 176-44-76-64 44 28-64-60 8Z" }],
  person: [{ type: "circle", cx: 128, cy: 92, r: 42 }, { type: "path", d: "M52 220c14-44 46-68 76-68s62 24 76 68" }],
  search: [{ type: "circle", cx: 112, cy: 112, r: 68 }, { type: "line", x1: 160, y1: 160, x2: 216, y2: 216 }],
  terminal: [{ type: "rect", x: 36, y: 56, width: 184, height: 144, rx: 14 }, { type: "path", d: "M72 100l36 28-36 28M128 164h56" }],
  wifi: [{ type: "path", d: "M48 100c44-36 116-36 160 0M80 136c26-22 70-22 96 0M112 172c10-8 22-8 32 0" }]
} satisfies Record<string, ReadonlyArray<IconShape>>;

const iconRegistry: Readonly<Record<string, IconDefinition>> = {
  account_balance: { shapes: baseIcons.bank },
  account_circle: { shapes: baseIcons.person },
  add_link: { shapes: baseIcons.link },
  api: { shapes: baseIcons.code },
  article: { shapes: baseIcons.file },
  arrow_forward: { shapes: baseIcons.arrowRight },
  bookmark: { shapes: baseIcons.bookmark },
  bookmark_border: { shapes: baseIcons.bookmark },
  briefcase: { shapes: baseIcons.briefcase },
  card_giftcard: { shapes: baseIcons.gift },
  cancel: { shapes: baseIcons.close },
  check_circle: { shapes: baseIcons.check },
  close: { shapes: baseIcons.close },
  code: { shapes: baseIcons.code },
  database: { shapes: baseIcons.database },
  description: { shapes: baseIcons.file },
  edit_document: { shapes: baseIcons.filePlus },
  edit_note: { shapes: baseIcons.note },
  event: { shapes: baseIcons.calendar },
  event_upcoming: { shapes: baseIcons.calendar },
  expand_more: { shapes: baseIcons.caretDown },
  explore: { shapes: baseIcons.compass },
  files: { shapes: baseIcons.file },
  gear: { shapes: baseIcons.person },
  history_edu: { shapes: baseIcons.graduation },
  id_card: { shapes: baseIcons.id },
  kanban: { shapes: baseIcons.list },
  location_on: { shapes: [{ type: "path", d: "M128 224s72-64 72-128a72 72 0 0 0-144 0c0 64 72 128 72 128Z" }, { type: "circle", cx: 128, cy: 96, r: 26 }] },
  lock_clock: { shapes: baseIcons.calendar },
  manage_search: { shapes: baseIcons.search },
  open_in_new: { shapes: [{ type: "path", d: "M92 64h100v100M192 64 88 168" }, { type: "path", d: "M168 184v24H48V88h24" }] },
  outgoing_mail: { shapes: baseIcons.paperPlane },
  payments: { shapes: baseIcons.money },
  person_search: { shapes: baseIcons.person },
  psychology_alt: { shapes: baseIcons.compass },
  public: { shapes: baseIcons.globe },
  radio_button_unchecked: { shapes: baseIcons.circle },
  rule: { shapes: baseIcons.check },
  rss_feed: { shapes: baseIcons.wifi },
  savings: { shapes: baseIcons.bank },
  school: { shapes: baseIcons.graduation },
  search: { shapes: baseIcons.search },
  sort: { shapes: baseIcons.list },
  stars: { shapes: [{ type: "path", d: "M128 36l24 58 62 6-47 40 14 60-53-32-53 32 14-60-47-40 62-6 24-58Z" }] },
  task_alt: { shapes: baseIcons.check },
  terminal: { shapes: baseIcons.terminal },
  translate: { shapes: baseIcons.globe },
  travel_explore: { shapes: baseIcons.globe },
  verified: { shapes: baseIcons.check },
  wifi: { shapes: baseIcons.wifi },
  workspace_premium: { shapes: baseIcons.graduation }
};

export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  const definition = iconRegistry[name] ?? { shapes: baseIcons.circle };

  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
      viewBox={definition.viewBox ?? "0 0 256 256"}
      width={size}
    >
      {definition.shapes.map((shape, index) => renderShape(shape, index))}
    </svg>
  );
}

function renderShape(shape: IconShape, index: number): ReactNode {
  if (shape.type === "path") {
    return <path key={index} d={shape.d} />;
  }

  if (shape.type === "circle") {
    return <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />;
  }

  if (shape.type === "line") {
    return <line key={index} x1={shape.x1} x2={shape.x2} y1={shape.y1} y2={shape.y2} />;
  }

  if (shape.type === "rect") {
    return <rect key={index} height={shape.height} rx={shape.rx ?? 0} width={shape.width} x={shape.x} y={shape.y} />;
  }

  return <polyline key={index} points={shape.points} />;
}
