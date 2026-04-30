"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

type Tab = { href: string; icon: IconName; label: string };

const TABS: Tab[] = [
  { href: "/settings", icon: "gear", label: "Settings" },
  { href: "/home", icon: "paper-pencil", label: "Home" },
  { href: "/history", icon: "arrow-clock", label: "History" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[var(--bg-app)] border-t border-[var(--divider)] safe-area-inset-bottom z-40">
      <div className="max-w-md mx-auto flex items-center px-4">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex items-center justify-center py-5 transition-colors ${
                active
                  ? "text-[var(--text-strong)]"
                  : "text-[var(--text-disabled)] hover:text-[var(--text-subtle)]"
              }`}
            >
              <Icon name={tab.icon} size={24} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/home") {
    // Home owns the root authed routes that don't belong to settings/history.
    return (
      pathname === "/home" ||
      pathname.startsWith("/daily") ||
      pathname.startsWith("/weekly") ||
      pathname.startsWith("/spontaneous") ||
      pathname.startsWith("/thanks")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
