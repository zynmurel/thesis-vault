"use client";

import * as React from "react";
import {
  AlertCircle,
  Bell,
  BellMinus,
  BookCheck,
  CheckCircle2,
  LoaderCircle,
  Moon,
  Sun,
  Undo2,
  XCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Button as ButtonSmall } from "@/components/ui/button-small";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";

export function NotificationToggle() {
  const { setTheme } = useTheme();
  const [take, setTake] = React.useState(2);
  const utilsInvalidate = api.useUtils();
  const [notifs, setNotifs] = React.useState<any[]>([]);

  const { data, isLoading } = api.notification.getAll.useQuery({
    take,
  });
  const { data: count } = api.notification.getUnreadCount.useQuery();
  const { mutate, isPending } = api.notification.markAsRead.useMutation({
    onSuccess: async () => {
      await utilsInvalidate.notification.getUnreadCount.invalidate();
      await utilsInvalidate.notification.getAll.invalidate();
    },
  });

  React.useEffect(() => {
    data?.length && setNotifs(data || []);
  }, [data]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-foreground size-8 rounded-full"
        >
          <Bell />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div
          className={`flex max-h-[50px] w-full flex-row items-center justify-between gap-2 p-3 text-sm font-semibold text-slate-800 shadow`}
        >
          <div className="flex flex-row items-center gap-1">
            <Bell className="size-4" strokeWidth={3} /> Notifications
            <div className="flex size-5 items-center justify-center rounded-full bg-red-500 text-white">
              {count}
            </div>
          </div>
        </div>
        <div className="relative flex max-h-[70vh] w-[600px] flex-col overflow-y-scroll">
          {/* <NotificationDialog
                open={openNotification}
                setOpen={setOpenNotification}
              /> */}
          {!notifs?.length ? (
            <div className="flex h-[80vh] flex-col items-center justify-center text-slate-500">
              <BellMinus className="size-10" />
              No notification found
            </div>
          ) : (
            notifs.map((d) => {
              const { title, message, icon } = getNotificationConfig(d);
              return (
                <div
                  key={d.id}
                  className={`flex w-full flex-row gap-1 border-b border-slate-300 p-2 hover:bg-slate-50 ${
                    d.isAdminRead ? "bg-slate-200 opacity-60" : ""
                  }`}
                >
                  <div className="p-2 py-3">{icon}</div>
                  <div className="w-full p-2">
                    <div className="flex w-full flex-row justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        {title}
                      </p>
                      {!d.isAdminRead && (
                        <ButtonSmall
                          className="cursor-pointer text-[10px]"
                          variant={"outline"}
                          disabled={isPending}
                          onClick={() => {
                            mutate({ id: d.id });
                            // setOpenNotification(d as any);
                          }}
                        >
                          Mark as Read
                        </ButtonSmall>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {isLoading ? (
            <div className="flex h-[10vh] flex-col items-center justify-center text-slate-500">
              <LoaderCircle className="animate-spin" />
              Loading
            </div>
          ) : (
            <></>
          )}
          <div className="flex items-center justify-center p-5">
            <ButtonSmall
              variant={"outline"}
              onClick={() => setTake((prev) => prev + 2)}
            >
              Show more
            </ButtonSmall>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getNotificationConfig = (d: any) => {
  const studentName = d.Student?.firstName ?? "A student";
  const thesisTitle = d.Thesis?.title ?? "a thesis";

  switch (d.type) {
    case "BORROW":
      return {
        title: "Borrow Successful",
        message: `${studentName} has successfully borrowed ${thesisTitle}.`,
        icon: <BookCheck className="size-6 text-green-600" strokeWidth={2.5} />,
      };

    case "DECLINED":
      return {
        title: "Borrow Request Declined",
        message: `${studentName}'s request to borrow ${thesisTitle} was declined.`,
        icon: <XCircle className="size-6 text-red-600" strokeWidth={2.5} />,
      };

    case "RETURN":
      return {
        title: "Return Successful",
        message: `${studentName} has returned ${thesisTitle} successfully.`,
        icon: <Undo2 className="size-6 text-blue-600" strokeWidth={2.5} />,
      };

    case "RETURN_WITH_PENALTY":
      return {
        title: "Return with Penalty",
        message: `${studentName} returned ${thesisTitle} late and incurred a penalty.`,
        icon: <AlertCircle className="size-6 text-red-600" strokeWidth={2.5} />,
      };

    case "PENALTY_SETTLED":
      return {
        title: "Penalty Settled",
        message: `${studentName} has settled the penalty for ${thesisTitle}.`,
        icon: (
          <CheckCircle2 className="size-6 text-green-600" strokeWidth={2.5} />
        ),
      };

    default:
      return {
        title: "Notification",
        message: `New notification regarding ${studentName}.`,
        icon: <BookCheck className="size-6 text-gray-500" strokeWidth={2.5} />,
      };
  }
};
