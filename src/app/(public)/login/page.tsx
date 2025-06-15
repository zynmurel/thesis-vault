import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./_components.tsx/login-form";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/app/(protected)/_components/mode-toggle";

export default async function Page() {
    const session = await auth();

  if (!!session?.user) {
    redirect("/");
  }
  return (
    <div className="relative grid min-h-screen bg-background lg:grid-cols-2">
      <div className="absolute top-3 left-3">
        <div className="flex flex-row items-center gap-2">
          <img
            src="/images/nwssu-ccis-logo.png"
            className="w-10 object-contain"
          />
          <div className="text-primary flex flex-col">
            <p className="text-sm font-bold">
              Northwest Samar State University
            </p>
            <p className="text-primary/80 text-xs font-semibold">
              College of Computing and Information Science
            </p>
          </div>
        </div>
      </div>
      <div className="bg-primary relative hidden flex-col items-center justify-center overflow-hidden px-5 sm:px-10 lg:flex">
        <img
          src="/images/nwssu-ccis-logo.png"
          className="w-60 object-contain"
        />
        <p className="pt-4 text-center text-2xl font-semibold text-white uppercase xl:text-3xl">
          Northwest Samar State University
        </p>
        <p className="text-secondary/90 text-center text-lg uppercase xl:text-xl">
          College of Computing and Information Science
        </p>
        <p className="mt-2 px-20 text-center text-white/90">
          <span>Thesis Vault</span> is an archiving system for student
          manuscripts at CCIS. Admins log in to manage and track borrowed
          theses.
        </p>
        <p></p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="flex min-w-full flex-col items-center justify-center gap-5 p-2 sm:min-w-lg">
          <Card className="w-full max-w-lg gap-5 border-none shadow-none bg-background">
            <CardHeader className="gap-0">
              <div className="text mb-5 text-3xl font-bold">
                Thesis Vault
              </div>
              <CardTitle className=" text-lg font-semibold sm:text-xl">
                Welcome back, Admin!
              </CardTitle>
              <CardDescription>
                Manage borrowed theses with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className=" absolute bottom-5 sm:top-5 right-5"><ModeToggle/></div>
    </div>
  );
}
