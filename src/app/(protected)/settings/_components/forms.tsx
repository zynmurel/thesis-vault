"use client";
// components/AdminDetailsForm.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, UserCircle, UserRoundCheck } from "lucide-react";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const adminDetailsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

export function AdminDetailsForm() {
  const utils = api.useUtils();
  const { data, isLoading } = api.settings.getAdminDetails.useQuery();
  const form = useForm({
    resolver: zodResolver(adminDetailsSchema),
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate({ ...data });
  });

  const { mutate, isPending } = api.settings.updateAdminDetails.useMutation({
    onSuccess: (data) => {
      form.reset({ ...data });
      toast.error(`Admin details updated successfully`);
      utils.settings.getAdminDetails.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating admin details: ${error.message}`);
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
      });
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5 shadow">
      <div className="flex flex-row items-center gap-2 font-semibold">
        <UserCircle strokeWidth={2.5} />
        Admin Information
      </div>
      <form onSubmit={onSubmit} className="flex flex-col items-end space-y-4">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <Input
            disabled={isLoading || isPending}
            {...form.register("firstName")}
            placeholder="First Name"
          />
          <Input
            disabled={isLoading || isPending}
            {...form.register("lastName")}
            placeholder="Last Name"
          />
          <Input
            disabled={isLoading || isPending}
            {...form.register("email")}
            placeholder="Email"
            type="email"
          />
        </div>
        <Button
          type="submit"
          className="sm:max-w-80"
          disabled={isLoading || isPending}
        >
          Update Details
        </Button>
      </form>
    </div>
  );
}

// components/ChangePasswordForm.tsx
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export function ChangePasswordForm() {
  const { data, isLoading } = api.settings.getAdminDetails.useQuery();
  const utils = api.useUtils();
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
  });
  const { mutate, isPending } = api.settings.updateAdminDetails.useMutation({
    onSuccess: () => {
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.error(`Admin password updated successfully`);
      utils.settings.getAdminDetails.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating admin password: ${error.message}`);
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const isValid = await bcrypt.compare(
      values.currentPassword as string,
      data?.password || "",
    );
    if (!isValid) {
      form.setError("currentPassword", {
        message: "Current password is incorrect",
      });
      return;
    }
    mutate({ password: bcrypt.hashSync(values.newPassword, 10) });
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5 shadow">
      <div className="flex flex-row items-center gap-2 font-semibold">
        <Lock strokeWidth={2.5} />
        Change Password
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col items-end space-y-4">
          <div className="grid w-full gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading || isPending}
                      type="password"
                      placeholder="Current Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading || isPending}
                      type="password"
                      placeholder="New Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading || isPending}
                      type="password"
                      placeholder="Confirm New Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading || isPending}>
            Change Password
          </Button>
        </form>
      </Form>
    </div>
  );
}

// components/ChangeUsernameForm.tsx
const changeUsernameSchema = z.object({
  username: z.string().min(3),
});

export function ChangeUsernameForm() {
  const utils = api.useUtils();
  const { data, isLoading } = api.settings.getAdminDetails.useQuery();
  const form = useForm({
    resolver: zodResolver(changeUsernameSchema),
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate({ ...data });
    console.log("Change username", data);
  });

  const { mutate, isPending } = api.settings.updateAdminDetails.useMutation({
    onSuccess: (data) => {
      form.reset({ ...data });
      toast.error(`Admin username updated successfully`);
      utils.settings.getAdminDetails.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating admin username: ${error.message}`);
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        username: data.username || "",
      });
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5 shadow">
      <div className="flex flex-row items-center gap-2 font-semibold">
        <UserRoundCheck strokeWidth={2.5} />
        Change Username
      </div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-end justify-between gap-5 sm:flex-row sm:items-center"
      >
        <Input
          {...form.register("username")}
          disabled={isLoading || isPending}
          placeholder="New Username"
          className="max-w-96"
        />
        <Button type="submit" disabled={isLoading || isPending}>
          Change Username
        </Button>
      </form>
    </div>
  );
}

// components/ChangeUsernameForm.tsx
const changeBorrowLimit = z.object({
  limit: z.coerce.number(),
});

export function ChangeBorrowLimit() {
  const utils = api.useUtils();
  const form = useForm({
    resolver: zodResolver(changeBorrowLimit),
  });
  const { data, isLoading } = api.settings.getAdminBorrowBookLimit.useQuery();

  const onSubmit = form.handleSubmit((data) => {
    mutate({ limitCount: data.limit });
  });

  const { mutate, isPending } =
    api.settings.updateAdminBorrowBookLimit.useMutation({
      onSuccess: (data) => {
        form.reset({ limit: data.limitCount });
        toast.error(`Borrow limit updated successfully`);
        utils.settings.getAdminBorrowBookLimit.invalidate();
      },
      onError: (error) => {
        toast.error(`Error updating borrow limit: ${error.message}`);
      },
    });

  useEffect(() => {
    if (data) {
      form.reset({ limit: data.limitCount });
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5 shadow">
      <div className="flex flex-row items-center gap-2 font-semibold">
        <div className="flex flex-col">
          <p className="font-semibold">Borrowed Book Limit</p>
          <p className="text-xs font-normal">
            This will be the count of borrowed book limit per student.
          </p>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-end justify-between gap-5 sm:flex-row sm:items-center"
      >
        <Input
          {...form.register("limit")}
          placeholder="Borrow limit"
          className="max-w-96"
          disabled={isLoading || isPending}
        />
        <Button type="submit" disabled={isLoading || isPending}>
          Update
        </Button>
      </form>
    </div>
  );
}

// components/ChangeUsernameForm.tsx
const changeBorrowDueDate = z.object({
  dayCount: z.coerce.number(),
});

export function ChangeBorrowDueDate() {
  const utils = api.useUtils();
  const form = useForm({
    resolver: zodResolver(changeBorrowDueDate),
  });
  const { data, isLoading } =
    api.settings.getAdminBorrowBookDayCount.useQuery();

  const onSubmit = form.handleSubmit((data) => {
    mutate({ dayCount: data.dayCount });
  });

  const { mutate, isPending } =
    api.settings.updateAdminBorrowBookDayCount.useMutation({
      onSuccess: (data) => {
        form.reset({ dayCount: data.dayCount });
        toast.error(`Borrow day count updated successfully`);
        utils.settings.getAdminBorrowBookLimit.invalidate();
      },
      onError: (error) => {
        toast.error(`Error updating borrow day count: ${error.message}`);
      },
    });

  useEffect(() => {
    if (data) {
      form.reset({ dayCount: data.dayCount });
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5 shadow">
      <div className="flex flex-row items-center gap-2 font-semibold">
        <div className="flex flex-col">
          <p className="font-semibold">Borrowing Day Limit</p>
          <p className="text-xs font-normal">
            Number of days allowed before the thesis must be returned
          </p>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-end justify-between gap-5 sm:flex-row sm:items-center"
      >
        <Input
          {...form.register("dayCount")}
          placeholder="Day count"
          className="max-w-96"
          disabled={isLoading || isPending}
        />
        <Button type="submit" disabled={isLoading || isPending}>
          Update
        </Button>
      </form>
    </div>
  );
}
