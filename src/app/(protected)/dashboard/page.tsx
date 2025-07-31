import { SectionCards } from "./_components/section-cards";
import { LayoutDashboard } from "lucide-react";
import React from "react";
import BorrowedBooksTable from "./_components/borrowed-table";
import OverdueTable from "./_components/overdue-table";
import ThesesBooksTable from "./_components/books-table";

function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <LayoutDashboard className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Dashboard</h2>
            <p className="-mt-1 text-sm">Overview of thesis borrowings, penalties, and overdue returns.</p>
          </div>
        </div>
      </div>
      <SectionCards />
      <BorrowedBooksTable/>
      <ThesesBooksTable/>
      <OverdueTable/>
    </div>
  );
}

export default Page;
