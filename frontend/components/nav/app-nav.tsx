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
    <aside className="sticky top-0 z-30 flex h-dvh w-[72px] flex-col border-r border-slate-200 bg-white backdrop-blur max-[760px]:h-16 max-[760px]:w-full max-[760px]:flex-row max-[760px]:border-b max-[760px]:border-r-0">
      <Link
        href="/opportunities"
        className="flex h-[72px] w-[72px] shrink-0 items-center justify-center text-center text-[11px] font-semibold leading-3 text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 max-[760px]:h-16 max-[760px]:w-20"
        aria-label="to the world"
      >
        to the<br />world
      </Link>

      <nav
        aria-label="Navigation principale"
        className="flex flex-1 flex-col items-center gap-2 px-3 py-4 max-[760px]:flex-row max-[760px]:justify-end max-[760px]:overflow-x-auto max-[760px]:py-2"
      >
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
                "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-l-2 border-transparent text-slate-500 transition-all duration-300 ease-in-out hover:-translate-y-px hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 active:translate-y-0",
                isActive && "border-l-blue-600 bg-blue-50 text-blue-700 shadow-sm"
              )}
            >
              <Icon size={21} weight={isActive ? "duotone" : "regular"} />
              <span className="pointer-events-none absolute left-[50px] top-1/2 z-40 -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-900 opacity-0 shadow-md transition-opacity duration-300 ease-in-out group-hover:opacity-100 max-[760px]:hidden">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
