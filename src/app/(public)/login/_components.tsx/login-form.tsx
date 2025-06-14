"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useEffect, useState } from "react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm() {
  const [mutationState, setMutationState] = useState({
    loading: false,
    error: false,
  });

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setMutationState((prev) => ({ ...prev, loading: true }));
    const res = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });
    setMutationState((prev) => ({ ...prev, loading: false }));

    if (!res?.error) {
      router.push("/");
    } else {
      setMutationState(() => ({ loading : false , error: true }));
    }
  };

  useEffect(()=>{
    if(mutationState.error){
      form.setError("username", {})
      form.setError("password", {})
    } else {
      form.clearErrors()
    }
    console.log(mutationState)
  },[mutationState.error, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onChange={()=>setMutationState(prev=>({ ...prev, error : false }))}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
        <p className={` -mt-2 text-end text-destructive text-sm  ${mutationState.error ? "visible" : "invisible"}`}>Wrong credentials</p>

        <Button
          type="submit"
          disabled={mutationState.loading}
          className=" w-full cursor-pointer rounded-full p-6 text-lg"
          size={"lg"}
        >
          Login
        </Button>
      </form>
    </Form>
  );
}

export default LoginForm;
