"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/use-app-store";

const NAV_LINKS = [
  { href: "/list", label: "Shopping List" },
  { href: "/compare", label: "Compare Prices" },
  { href: "/deals", label: "Weekly Deals" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const itemCount = useAppStore((s) => s.list.length);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo className="text-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  active
                    ? "text-primary-foreground bg-primary shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            render={<Link href="/list" />}
            nativeButton={false}
            className="rounded-full font-semibold"
          >
            <ShoppingCart className="size-4" />
            My List
            {hasHydrated && itemCount > 0 && (
              <Badge className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-primary-foreground hover:bg-primary-foreground/20">
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <SheetClose
                    key={link.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80 hover:bg-accent"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                );
              })}
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/list"
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-base font-semibold text-primary-foreground"
                  />
                }
              >
                <ShoppingCart className="size-4" />
                My List
                {hasHydrated && itemCount > 0 && (
                  <Badge className="rounded-full bg-primary-foreground/20 px-1.5 text-primary-foreground hover:bg-primary-foreground/20">
                    {itemCount}
                  </Badge>
                )}
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
