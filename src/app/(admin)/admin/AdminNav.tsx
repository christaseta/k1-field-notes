"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string }[] = [
  { href: "/admin", label: "Weekly digest" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/invite", label: "Invite a seller" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="admin-nav">
      <div className="admin-nav__brand">Field notes</div>
      <nav className="admin-nav__list" aria-label="Admin">
        {ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"admin-nav__link" + (isActive ? " is-active" : "")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
