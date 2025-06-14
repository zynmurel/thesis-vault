import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

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
      <AppSidebar variant="inset" />
      <div className=" bg-gradient-to-r from-sidebar dark:to-green-900/50 to-green-700  flex h-screen max-h-screen w-full flex-col md:p-2">
        <div className="h-full w-full overflow-hidden md:rounded-xl">
          <div className="relative flex h-full flex-col bg-background">
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
