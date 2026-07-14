"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="ADCESP — página inicial">
          <Logo className="h-11 w-auto" />
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) =>
            item.children ? (
              <div key={item.href} className="group relative">
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    isActive(item.href) && "text-primary"
                  )}
                >
                  {item.title}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 w-56 rounded-md border bg-white p-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-sm px-3 py-2 text-sm hover:bg-accent"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  isActive(item.href) && "text-primary"
                )}
              >
                {item.title}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <Button asChild size="sm">
            <Link href="/filiacao">Filie-se</Link>
          </Button>
        </div>

        {/* Botão mobile */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t bg-white lg:hidden">
          <nav className="container flex flex-col py-2">
            {mainNav.map((item) =>
              item.children ? (
                <div key={item.href}>
                  <button
                    onClick={() =>
                      setOpenSubmenu((s) =>
                        s === item.href ? null : item.href
                      )
                    }
                    className="flex w-full items-center justify-between px-2 py-3 text-sm font-medium"
                  >
                    {item.title}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenu === item.href && "rotate-180"
                      )}
                    />
                  </button>
                  {openSubmenu === item.href && (
                    <div className="ml-4 flex flex-col border-l pl-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="px-2 py-2 text-sm text-muted-foreground"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-2 py-3 text-sm font-medium"
                >
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
