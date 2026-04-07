"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Form, FormField } from "@/components/ui/form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { httpRequest, isSuccess } from "@/lib/http";
import { useAuthStore } from "@/stores/auth-store";

const signInSchema = z.object({
  email: z.email({ error: "请输入有效邮箱" }),
  password: z.string().min(1, { error: "请输入密码" }),
});

type SignInValues = z.infer<typeof signInSchema>;

type LoginData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

async function postLogin(values: SignInValues) {
  const res = await httpRequest.post<LoginData>("auth/login", values, {
    skipAuth: true,
    skipErrorHandler: true,
  });
  if (!isSuccess(res.code) || !res.data) {
    throw new Error(res.msg || "登录失败，请重试");
  }
  return res.data;
}

export function SignInForm() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (tokens) => {
      setUser(null);
      setTokens(tokens);
      router.push("/dashboard");
    },
    onError: (error) => {
      clearSession();
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "登录失败，请重试",
      });
    },
  });

  function onSubmit(values: SignInValues) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup className="gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sign-in-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sign-in-password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...field}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <LiquidButton type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in…" : "Continue"}
        </LiquidButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Form>
  );
}
