import { cn } from "@/lib/cn";

type MaterialIconProps = Readonly<{
  name: string;
  className?: string;
  size?: number;
}>;

export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  return (
    <span aria-hidden="true" className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>
      {name}
    </span>
  );
}
