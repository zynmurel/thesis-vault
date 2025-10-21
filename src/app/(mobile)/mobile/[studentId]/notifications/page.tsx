"use client";
import { api } from "@/trpc/react";
import type {
  StudentBorrow,
  StudentBorrowNotification,
  Theses,
} from "@prisma/client";
import {
  AlertCircle,
  Bell,
  BellMinus,
  BookCheck,
  CheckCircle2,
  LoaderCircle,
  Undo2,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function Notifications() {
  const { studentId } = useParams();
  const utils = api.useUtils();
  const [take, setTake] = useState(10);
  const [isUnread, setIsUnread] = useState(false);
  const [openNotification, setOpenNotification] = useState<
    | null
    | (StudentBorrowNotification & {
        Thesis?: Theses;
        StudentBorrow?: StudentBorrow;
      })
  >(null);
  const { data, isLoading, isFetching } =
    api.mobile.notification.getAllNotifications.useQuery(
      {
        studentId: String(studentId),
        take: take,
        unread: isUnread,
      },
      { placeholderData: (prev) => prev },
    );
  const { data: count } =
    api.mobile.notification.getAllNotificationsCount.useQuery({
      studentId: String(studentId),
      unread: isUnread,
    });
  const { mutate } = api.mobile.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.mobile.notification.getAllNotifications.invalidate();
    },
  });
  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col overflow-y-scroll">
      <NotificationDialog
        open={openNotification}
        setOpen={setOpenNotification}
      />
      <div
        className={`bg-sidebar flex max-h-[50px] w-full flex-row items-center justify-between gap-2 p-3 text-sm font-semibold text-slate-800 shadow`}
      >
        <div className="flex flex-row items-center gap-1">
          <Bell className="size-4" strokeWidth={3} /> Notifications
        </div>
        <div className="bg-sidebar flex flex-row rounded-2xl text-xs brightness-95 transition-all ease-in-out">
          <div
            className={`w-18 flex-1 rounded-2xl p-1 px-4 text-center transition-all ease-in-out ${!isUnread ? "bg-white shadow" : ""}`}
            onClick={() => setIsUnread(false)}
          >
            All
          </div>
          <div
            className={`w-18 flex-1 rounded-2xl p-1 px-4 text-center transition-all ease-in-out ${isUnread ? "bg-white shadow" : ""}`}
            onClick={() => setIsUnread(true)}
          >
            Unread
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-[80vh] flex-col items-center justify-center text-slate-500">
          <LoaderCircle className="animate-spin" />
          Loading
        </div>
      ) : !data?.length ? (
        <div className="flex h-[80vh] flex-col items-center justify-center text-slate-500">
          <BellMinus className="size-10" />
          No notification found
        </div>
      ) : (
        data.map((d) => {
          const { title, message, icon } = getNotificationConfig(d);
          return (
            <div
              key={d.id}
              className={`flex flex-row gap-1 border-b border-slate-300 p-2 hover:bg-slate-50 ${
                d.isRead ? "bg-slate-200 opacity-70" : ""
              }`}
              onClick={() => {
                mutate({ id: d.id });
                setOpenNotification(d as any);
              }}
            >
              <div className="p-2 py-3">{icon}</div>
              <div className="p-2">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{message}</p>
              </div>
            </div>
          );
        })
      )}
      <div>
        {(count || 0) > (data?.length || 0) ? (
          isFetching ? (
            <div
              className="mt-1 w-full rounded-full p-2 text-center text-xs opacity-50">Loading ...</div>
          ) : (
            <div
              className="mt-1 w-full rounded-full p-2 text-center text-xs"
              onClick={() => setTake((prev) => prev + 10)}
            >
              Load more
            </div>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
const getNotificationConfig = (d: any) => {
  switch (d.type) {
    case "BORROW":
      return {
        title: "Borrow Successful",
        message: `You have successfully borrowed ${d.Thesis?.title ?? "a thesis"}.`,
        icon: <BookCheck className="size-6 text-green-600" strokeWidth={2.5} />,
      };
    case "DECLINED":
      return {
        title: "Borrow Request Declined",
        message: `Your request to borrow ${d.Thesis?.title ?? "a thesis"} was declined.`,
        icon: <XCircle className="size-6 text-red-600" strokeWidth={2.5} />,
      };
    case "RETURN":
      return {
        title: "Return Successful",
        message: `You have returned ${d.Thesis?.title ?? "a thesis"} successfully.`,
        icon: <Undo2 className="size-6 text-blue-600" strokeWidth={2.5} />,
      };
    case "RETURN_WITH_PENALTY":
      return {
        title: "Return with Penalty",
        message: `You returned ${d.Thesis?.title ?? "a thesis"} late and incurred a penalty.`,
        icon: <AlertCircle className="size-6 text-red-600" strokeWidth={2.5} />,
      };
    case "PENALTY_SETTELED":
      return {
        title: "Penalty Settled",
        message: `Your penalty for ${d.Thesis?.title ?? "a thesis"} has been settled.`,
        icon: (
          <CheckCircle2 className="size-6 text-green-600" strokeWidth={2.5} />
        ),
      };
    default:
      return {
        title: "Notification",
        message: "You have a new notification.",
        icon: <BookCheck className="size-6 text-gray-500" strokeWidth={2.5} />,
      };
  }
};

const NotificationDialog = ({
  open,
  setOpen,
}: {
  open:
    | (StudentBorrowNotification & {
        Thesis?: Theses;
        StudentBorrow?: StudentBorrow;
      })
    | null;
  setOpen: React.Dispatch<
    React.SetStateAction<
      | (StudentBorrowNotification & {
          Thesis?: Theses;
          StudentBorrow?: StudentBorrow;
        })
      | null
    >
  >;
}) => {
  if (!open) return null;
  const { title, message, icon } = getNotificationConfig(open);
  return (
    <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-row items-center gap-2">
            {icon}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="mt- text-xs text-slate-600">
          <div>{message}</div>
          {open.type === "RETURN_WITH_PENALTY" && open.StudentBorrow ? (
            <p className="text-destructive mt-2">
              {getOverdueDetail(
                open.StudentBorrow.borrowDueAt!,
                open.StudentBorrow.returnedAt!,
              )}
            </p>
          ) : (
            <></>
          )}
          <p className="mt-2 text-end text-xs text-slate-400">
            <span className="font-semibold"></span>{" "}
            {open?.createdAt && new Date(open.createdAt).toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
const getOverdueDetail = (
  dueDate: Date | string,
  returnDate: Date | string,
) => {
  const due = new Date(dueDate).getTime();
  const ret = new Date(returnDate).getTime();

  if (ret <= due) return "On time";

  let diff = Math.floor((ret - due) / 1000); // difference in seconds

  const days = Math.floor(diff / (60 * 60 * 24));
  diff %= 60 * 60 * 24;

  const hours = Math.floor(diff / (60 * 60));
  diff %= 60 * 60;

  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);

  return parts.join(" ") + " overdue";
};

export default Notifications;
