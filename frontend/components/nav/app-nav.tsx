"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";

type NavItem = Readonly<{
  href: string;
  label: string;
  icon: string;
}>;

const navItems: ReadonlyArray<NavItem> = [
  { href: "/opportunities", label: "Opportunités", icon: "travel_explore" },
  { href: "/pipeline", label: "Suivi", icon: "kanban" },
  { href: "/saved", label: "Sauvegardées", icon: "bookmark_border" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[rgba(3,25,46,0.86)] shadow-[0_18px_60px_rgba(3,25,46,0.22)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.035)_38%,rgba(3,25,46,0.18))]" />
      <div className="relative mx-auto flex w-full max-w-container-max flex-col gap-4 px-margin-mobile py-4 md:flex-row md:items-center md:justify-between md:px-margin-desktop">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/opportunities"
            className="font-display text-headline-md font-bold text-on-primary transition-opacity hover:opacity-90 focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.24)]"
            aria-label="to the world"
          >
            to the world
          </Link>

          <Link
            href="/settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-on-primary transition-colors hover:bg-white/[0.14] focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.24)] md:hidden"
            aria-label="Paramètres"
          >
            <MaterialIcon name="account_circle" size={24} />
          </Link>
        </div>

        <nav aria-label="Navigation principale" className="flex gap-2 overflow-x-auto md:gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full border px-3 py-2 text-label-md transition-colors duration-200 focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.24)]",
                  isActive
                    ? "border-white/[0.22] bg-white/[0.16] font-semibold text-on-primary"
                    : "border-transparent text-white/70 hover:border-white/[0.12] hover:bg-white/10 hover:text-on-primary"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <MaterialIcon name={item.icon} size={17} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-on-primary transition-colors hover:bg-white/[0.14] focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.24)]"
            aria-label="Paramètres"
          >
            <MaterialIcon name="account_circle" size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
