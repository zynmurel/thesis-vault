import { redirect } from "next/navigation";
import React from "react";

function Page() {
  redirect("/dashboard");
  return <div>Page</div>;
}

export default Page;
