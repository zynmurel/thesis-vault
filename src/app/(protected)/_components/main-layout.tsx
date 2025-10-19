import ScanQR from "@/app/_components/ScanQR";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TagsModal } from "../settings/_components/tag-modal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ScanQR />
      <TagsModal />
      <AppSidebar variant="inset" />
      <div className="from-sidebar to-sidebar flex h-screen max-h-screen w-full flex-col bg-gradient-to-r md:p-2 dark:to-green-900/50">
        <div className="h-full w-full overflow-hidden md:rounded-xl">
          <div className="bg-background/95 relative flex h-full flex-col">
            <SiteHeader />
            <div className="flex flex-1 flex-col overflow-y-scroll p-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
