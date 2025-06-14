import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import MainLayout from "./_components/main-layout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <MainLayout>{children}</MainLayout>;
}
