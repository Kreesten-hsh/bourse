"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";

type NavItem = Readonly<{
  href: string;
  label: string;
}>;

const navItems: ReadonlyArray<NavItem> = [
  { href: "/opportunities", label: "Opportunités" },
  { href: "/pipeline", label: "Suivi" },
  { href: "/saved", label: "Sauvegardées" },
  { href: "/documents", label: "Dossiers" }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface">
      <div className="mx-auto flex w-full max-w-container-max flex-col gap-4 px-margin-mobile py-4 md:flex-row md:items-center md:justify-between md:px-margin-desktop">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/opportunities"
            className="font-display text-headline-md font-bold text-primary transition-opacity hover:opacity-90 focus:outline-none focus-visible:shadow-focus"
            aria-label="to the world"
          >
            to the world
          </Link>

          <Link
            href="/settings"
            className="grid h-10 w-10 place-items-center rounded-full text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus-visible:shadow-focus md:hidden"
            aria-label="Paramètres"
          >
            <MaterialIcon name="account_circle" size={26} />
          </Link>
        </div>

        <nav aria-label="Navigation principale" className="flex gap-6 overflow-x-auto md:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap border-b-2 pb-1 text-label-md transition-colors duration-200 focus:outline-none focus-visible:shadow-focus",
                  isActive
                    ? "border-primary font-bold text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <label className="relative block">
            <span className="sr-only">Rechercher</span>
            <MaterialIcon name="search" className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              className="w-64 border-0 border-b border-outline-variant bg-transparent py-2 pl-7 pr-2 text-body-md text-on-surface outline-none transition-colors placeholder:text-secondary focus:border-primary focus:ring-0"
              placeholder="Rechercher..."
              type="search"
            />
          </label>
          <Link
            href="/settings"
            className="grid h-10 w-10 place-items-center rounded-full text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus-visible:shadow-focus"
            aria-label="Paramètres"
          >
            <MaterialIcon name="account_circle" size={28} />
          </Link>
        </div>
      </div>
    </header>
  );
}
