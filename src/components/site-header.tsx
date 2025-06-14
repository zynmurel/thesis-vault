'use client'
import { ModeToggle } from "@/app/(protected)/_components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { menu } from "@/lib/const/sidebar-menu"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const path = usePathname()
  const header = menu.find((m)=>path.startsWith(m.url))
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className=" flex flex-row gap-2">
          {/* {header?.icon && <header.icon/>} */}
          <h1 className="text-base font-medium">{header?.title}</h1>
        </div>
      </div>

      <div className=" px-4 lg:px-5">
        <ModeToggle />
      </div>
    </header>
  )
}
