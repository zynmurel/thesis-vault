"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { menu } from "@/lib/const/sidebar-menu";
import { Button } from "./ui/button";
import { ScanBarcode } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [_, setQR] = useQueryState("ScanQR", parseAsString)
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center gap-2 p-2 py-0">
            {/* <BookKey className="!size-7" /> */}
            <div>
              <span className="text-lg font-black uppercase text-foreground/80">Thesis Vault</span>
              <p className=" text-xs -mt-1 font-medium text-priary">NWSSU (CCIS)</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
        {/* <NavSecondary items={menu.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <Button size={"lg"} className=" cursor-pointer" onClick={()=>setQR("open")}><ScanBarcode/><p className=" pr-3">Scan Book</p></Button>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
