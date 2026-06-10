"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Broadcast, Files, GearSix, Globe, Kanban } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

type NavItem = Readonly<{
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "duotone" | "fill"; className?: string }>;
}>;

const navItems: ReadonlyArray<NavItem> = [
  { href: "/opportunities", label: "Opportunités", icon: Globe },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/sources", label: "Sources", icon: Broadcast },
  { href: "/documents", label: "Documents", icon: Files },
  { href: "/settings", label: "Paramètres", icon: GearSix }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 flex h-dvh w-16 flex-col border-r border-border bg-surface-2 max-[760px]:h-16 max-[760px]:w-full max-[760px]:flex-row max-[760px]:border-b max-[760px]:border-r-0">
      <Link
        href="/opportunities"
        className="flex h-16 w-16 shrink-0 items-center justify-center text-center text-[11px] font-semibold leading-3 text-royal"
        aria-label="to the world"
      >
        to the<br />world
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2 px-2 py-3 max-[760px]:flex-row max-[760px]:justify-end max-[760px]:overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={cn(
                "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-l-2 border-transparent text-ink-60 transition-colors duration-150 hover:bg-royal-light hover:text-royal",
                isActive && "border-l-royal bg-[var(--royal-alpha10)] text-royal"
              )}
            >
              <Icon size={21} weight={isActive ? "duotone" : "regular"} />
              <span className="pointer-events-none absolute left-[52px] top-1/2 z-40 -translate-y-1/2 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 max-[760px]:hidden">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
