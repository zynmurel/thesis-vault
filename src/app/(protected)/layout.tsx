import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import MainLayout from "./_components/main-layout";
import { ThemeProvider } from "@/components/theme-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MainLayout>{children}</MainLayout>
    </ThemeProvider>
  );
}
