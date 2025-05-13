"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, Settings, Shield, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      label: "Établissement",
      icon: Building,
      active: pathname === "/admin",
    },
    {
      href: "/admin/utilisateurs",
      label: "Utilisateurs",
      icon: Users,
      active: pathname === "/admin/utilisateurs",
    },
    {
      href: "/admin/roles",
      label: "Rôles",
      icon: Shield,
      active: pathname === "/admin/roles",
    },
    {
      href: "/admin/permissions",
      label: "Permissions",
      icon: Settings,
      active: pathname === "/admin/permissions",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <nav className="grid gap-2 text-lg font-medium">
                  {routes.map((route) => (
                    <SheetClose asChild key={route.href}>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent",
                          route.active ? "bg-accent" : "transparent",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                        {route.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="font-bold text-xl">
              Administration
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent",
                  route.active ? "bg-accent" : "transparent",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
