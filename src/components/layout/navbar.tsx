"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, navCta, isGrupo, type NavLink as NavLinkType } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  // Fecha o menu mobile ao navegar.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  const ativo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const grupoAtivo = (links: NavLinkType[]) => links.some((l) => ativo(l.href));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="ADCESP — página inicial" className="shrink-0">
          <Logo className="h-11 w-auto" />
        </Link>

        {/* ---------------- Desktop (lg+) ---------------- */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {mainNav.map((item) =>
              isGrupo(item) ? (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger
                    className={cn(
                      grupoAtivo(item.children) && "text-primary"
                    )}
                  >
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[320px] p-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.href}
                              className={cn(
                                "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent focus:bg-accent",
                                ativo(child.href) && "bg-accent/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-sm font-medium leading-none",
                                  ativo(child.href) && "text-primary"
                                )}
                              >
                                {child.title}
                              </span>
                              {child.descricao && (
                                <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                                  {child.descricao}
                                </span>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        ativo(item.href) && "text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA desktop */}
        <Button asChild className="hidden shrink-0 lg:inline-flex">
          <Link href={navCta.href}>{navCta.title}</Link>
        </Button>

        {/* ---------------- Mobile (< lg) ---------------- */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild size="sm" className="h-11 px-4">
            <Link href={navCta.href}>{navCta.title}</Link>
          </Button>

          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger
              aria-label="Abrir menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-accent"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[88vw] max-w-sm p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

              <div className="flex h-16 items-center border-b px-4">
                <Logo className="h-9 w-auto" />
              </div>

              {/* Links (rolável) */}
              <nav className="max-h-[calc(100vh-8.5rem)] overflow-y-auto px-2 py-2">
                <Accordion type="multiple" className="w-full">
                  {mainNav.map((item) =>
                    isGrupo(item) ? (
                      <AccordionItem
                        key={item.title}
                        value={item.title}
                        className="border-b-0"
                      >
                        <AccordionTrigger
                          className={cn(
                            "min-h-[44px] rounded-md px-3 py-3 text-base font-semibold hover:no-underline",
                            grupoAtivo(item.children) && "text-primary"
                          )}
                        >
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <div className="ml-3 flex flex-col border-l pl-2">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "flex min-h-[44px] items-center rounded-md px-3 text-sm text-slate-600 transition-colors hover:bg-accent",
                                  ativo(child.href) &&
                                    "font-semibold text-primary"
                                )}
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex min-h-[44px] items-center rounded-md px-3 text-base font-semibold transition-colors hover:bg-accent",
                          ativo(item.href) && "text-primary"
                        )}
                      >
                        {item.title}
                      </Link>
                    )
                  )}
                </Accordion>
              </nav>

              {/* CTA fixo no rodapé do menu */}
              <div className="absolute inset-x-0 bottom-0 border-t bg-background p-4">
                <Button asChild size="lg" className="h-12 w-full text-base">
                  <Link href={navCta.href}>{navCta.title}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
