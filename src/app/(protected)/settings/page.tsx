import { Settings, Settings2 } from "lucide-react";
import React from "react";
import {
  AdminDetailsForm,
  ChangeBorrowDueDate,
  ChangeBorrowLimit,
  ChangePasswordForm,
  ChangeUsernameForm,
} from "./_components/forms";
import TagsPage from "./_components/tag-settings";

function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Settings className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Settings</h2>
            <p className="-mt-1 text-sm">Manage admin settings</p>
          </div>
        </div>
      </div>
      <div className=" space-y-4 sm:px-5 sm:py-2">
        <TagsPage/>
        <AdminDetailsForm />
        <ChangeUsernameForm />
        <ChangePasswordForm />
      </div>
      <div className=" px-5 space-y-4">
        <p className=" flex flex-row gap-1 items-center font-semibold"><Settings strokeWidth={2.5}/> System Settings</p>
        <div className=" grid sm:grid-cols-2 gap-5">
          <ChangeBorrowLimit/>
          <ChangeBorrowDueDate/>
        </div>
      </div>
    </div>
  );
}

export default Page;
